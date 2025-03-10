const axios = require('axios');
const sizeOf = require('image-size');
const fs = require('fs-extra');
const path = require('path');
const storeService = require('./storeService');
const { promisify } = require('util');

class ImageProcessor {
    constructor() {
        this.jobs = {};
        this.tempDir = path.resolve(__dirname, '../../temp');
        fs.ensureDirSync(this.tempDir);
    }

    async submitJob(jobData) {
        const jobId = Date.now().toString();
        
        // Validate job data
        if (!jobData.visits || jobData.count !== jobData.visits.length) {
            throw new Error('Invalid job data: count does not match number of visits');
        }

        // Initialize job status
        this.jobs[jobId] = {
            status: 'ongoing',
            results: [],
            errors: [],
            totalImages: 0,
            processedImages: 0
        };

        // Count total images
        jobData.visits.forEach(visit => {
            this.jobs[jobId].totalImages += visit.image_url.length;
        });

        // Process job asynchronously
        this.processJob(jobId, jobData).catch(err => {
            console.error(`Error processing job ${jobId}:`, err);
            this.jobs[jobId].status = 'failed';
            this.jobs[jobId].errors.push({
                error: 'Job processing failed unexpectedly'
            });
        });

        return jobId;
    }

    async processJob(jobId, jobData) {
        for (const visit of jobData.visits) {
            // Check if store exists
            if (!storeService.storeExists(visit.store_id)) {
                this.jobs[jobId].status = 'failed';
                this.jobs[jobId].errors.push({
                    store_id: visit.store_id,
                    error: 'Store ID does not exist'
                });
                return;
            }

            // Process images for this store
            for (const imageUrl of visit.image_url) {
                try {
                    const perimeter = await this.processImage(imageUrl);
                    
                    // Add random delay to simulate GPU processing
                    await this.randomDelay();
                    
                    // Store result
                    this.jobs[jobId].results.push({
                        store_id: visit.store_id,
                        store_name: storeService.getStoreInfo(visit.store_id).store_name,
                        area_code: storeService.getStoreInfo(visit.store_id).area_code,
                        image_url: imageUrl,
                        perimeter: perimeter,
                        visit_time: visit.visit_time
                    });
                    
                    this.jobs[jobId].processedImages++;
                } catch (error) {
                    this.jobs[jobId].status = 'failed';
                    this.jobs[jobId].errors.push({
                        store_id: visit.store_id,
                        error: `Failed to process image: ${imageUrl}, Error: ${error.message}`
                    });
                    return;
                }
            }
        }

        // Check if all images processed successfully
        if (this.jobs[jobId].processedImages === this.jobs[jobId].totalImages) {
            this.jobs[jobId].status = 'completed';
        }
    }

    async processImage(imageUrl) {
        // Create a unique filename for the downloaded image
        const imageName = `${Date.now()}-${path.basename(imageUrl)}`;
        const imagePath = path.join(this.tempDir, imageName);
        
        try {
            // Download the image
            const response = await axios({
                method: 'get',
                url: imageUrl,
                responseType: 'stream'
            });
            
            // Save the image to a temporary location
            const writer = fs.createWriteStream(imagePath);
            response.data.pipe(writer);
            
            // Wait for the download to complete
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            // Get image dimensions
            const dimensions = sizeOf(imagePath);
            
            // Calculate perimeter: 2 * (height + width)
            const perimeter = 2 * (dimensions.height + dimensions.width);
            
            // Clean up temporary file
            await fs.remove(imagePath);
            
            return perimeter;
        } catch (error) {
            // Clean up if file exists
            if (fs.existsSync(imagePath)) {
                await fs.remove(imagePath);
            }
            throw error;
        }
    }

    async randomDelay() {
        const delay = Math.random() * 300 + 100; // Random delay between 100ms (0.1s) and 400ms (0.4s)
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    getJobStatus(jobId) {
        const job = this.jobs[jobId];
        if (!job) {
            return null;
        }

        if (job.status === 'failed') {
            return {
                status: job.status,
                job_id: jobId,
                error: job.errors
            };
        }

        return {
            status: job.status,
            job_id: jobId
        };
    }
}

// Singleton instance
const imageProcessor = new ImageProcessor();

module.exports = imageProcessor;
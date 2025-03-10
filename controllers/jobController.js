const imageProcessor = require('../services/imageProcessor');

const submitJob = async (req, res) => {
    try {
        const jobData = req.body;
        
        // Basic validation
        if (!jobData.count || !jobData.visits || !Array.isArray(jobData.visits)) {
            return res.status(400).json({ error: 'Invalid job data: missing required fields' });
        }
        
        if (jobData.count !== jobData.visits.length) {
            return res.status(400).json({ error: 'Invalid job data: count does not match number of visits' });
        }

        // Validate visits data
        for (const visit of jobData.visits) {
            if (!visit.store_id) {
                return res.status(400).json({ error: 'Invalid job data: missing store_id in a visit' });
            }
            
            if (!visit.image_url || !Array.isArray(visit.image_url) || visit.image_url.length === 0) {
                return res.status(400).json({ error: 'Invalid job data: missing or invalid image_url array in a visit' });
            }
        }
        
        // Submit job for processing
        const jobId = await imageProcessor.submitJob(jobData);
        
        return res.status(201).json({ job_id: jobId });
    } catch (error) {
        console.error('Error submitting job:', error);
        return res.status(400).json({ error: error.message });
    }
};

const getJobStatus = (req, res) => {
    const { jobid } = req.query;
    
    if (!jobid) {
        return res.status(400).json({ error: 'Missing jobid parameter' });
    }
    
    const jobStatus = imageProcessor.getJobStatus(jobid);
    
    if (!jobStatus) {
        return res.status(400).json({});
    }
    
    return res.status(200).json(jobStatus);
};

module.exports = {
    submitJob,
    getJobStatus
};
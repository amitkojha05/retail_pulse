const csv = require('csv-parser');
const fs = require('fs-extra');
const path = require('path');

class StoreService {
    constructor() {
        this.stores = {};
        this.loadStoreData();
    }

    loadStoreData() {
        // Try multiple possible locations for the CSV file
        const possiblePaths = [
            path.resolve(__dirname, '../../data/StoreMasterAssignment.csv'),
            path.resolve(__dirname, '../data/StoreMasterAssignment.csv'),
            path.resolve(process.cwd(), 'data/StoreMasterAssignment.csv'),
            path.resolve(process.cwd(), 'StoreMasterAssignment.csv')
        ];

        let csvFilePath = null;
        for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
                csvFilePath = filePath;
                break;
            }
        }

        if (!csvFilePath) {
            console.warn("WARNING: StoreMasterAssignment.csv not found in any of the expected locations.");
            console.warn("Creating a sample store data for testing purposes.");
            
            // Create some sample data for testing
            this.stores = {
                "RP00001": {
                    store_name: "Sample Store 1",
                    area_code: "A001"
                },
                "RP00002": {
                    store_name: "Sample Store 2",
                    area_code: "A002"
                }
            };
            return;
        }

        try {
            console.log(`Loading store data from: ${csvFilePath}`);
            
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    // Map the CSV column names to the expected format
                    // The actual CSV has AreaCode, StoreName, StoreID
                    const storeId = data.StoreID;
                    
                    if (storeId) {
                        this.stores[storeId] = {
                            store_name: data.StoreName || '',
                            area_code: data.AreaCode || ''
                        };
                    }
                })
                .on('end', () => {
                    console.log('Store master data loaded successfully');
                    console.log(`Loaded ${Object.keys(this.stores).length} stores`);
                    
                    // Log a few stores for verification
                    const storeIds = Object.keys(this.stores);
                    if (storeIds.length > 0) {
                        console.log('Sample stores:');
                        for (let i = 0; i < Math.min(3, storeIds.length); i++) {
                            console.log(`  ${storeIds[i]}: ${this.stores[storeIds[i]].store_name} (${this.stores[storeIds[i]].area_code})`);
                        }
                    }
                })
                .on('error', (error) => {
                    console.error('Error parsing CSV:', error);
                    this.createSampleData();
                });
        } catch (error) {
            console.error('Error loading store master data:', error);
            this.createSampleData();
        }
    }

    createSampleData() {
        console.warn("Creating sample store data for testing purposes.");
        this.stores = {
            "RP00001": {
                store_name: "B P STORE",
                area_code: "7100015"
            },
            "RP00002": {
                store_name: "MONAJ STORE",
                area_code: "7100015"
            }
        };
    }

    getStoreInfo(storeId) {
        return this.stores[storeId];
    }

    storeExists(storeId) {
        return !!this.stores[storeId];
    }
}

// Singleton instance
const storeService = new StoreService();

module.exports = storeService;
try {
    console.log('Loading DataManager module...');
    import('./utils/dataManager.js').then(module => {
        const DataManager = module.default;
        
        console.log('DataManager object:', DataManager);
        console.log('DataManager keys:', Object.keys(DataManager));
        console.log('DataManager prototype:', Object.getPrototypeOf(DataManager));
        
        if (typeof DataManager === 'function') {
            console.log('DataManager is a constructor function');
        } else if (typeof DataManager === 'object') {
            console.log('DataManager is an object');
            console.log('ensureDirectories:', DataManager.ensureDirectories);
            console.log('log:', DataManager.log);
        }
        
        // Try accessing the function directly
        if (DataManager.ensureDirectories) {
            console.log('ensureDirectories function exists');
            
            // Test the functionality
            async function testDataManager() {
                try {
                    await DataManager.ensureDirectories();
                    console.log('Directories created successfully');
                    await DataManager.log('Test log message');
                    console.log('Log message written successfully');
                } catch (error) {
                    console.error('Error in test:', error);
                }
            }
            
            testDataManager();
        } else {
            console.log('ensureDirectories function does not exist');
        }
    }).catch(error => {
        console.error('Error loading module:', error);
    });
} catch (error) {
    console.error('Error in import:', error);
}
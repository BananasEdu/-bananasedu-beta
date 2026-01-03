import { checkApiConnection } from './src/lib/authApi';

// Mock fetch for environment where it might not be available or just to test the logic
// In a real node environment, we need to polyfill fetch if version < 18
// But since we are in a modern environment usually, let's try direct execution

console.log('Testing API Connection...');
const url = 'https://script.google.com/macros/s/AKfycbyM3_zw_x29CGos_Q6TKjTNB678W9kR1g25YMOklQiLPaH5MuCvk0fkOAFdbdNfy783/exec';

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log('✅ API Connection Successful!');
            console.log('Message:', data.message);
        } else {
            console.error('❌ API Error:', data.error);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    });

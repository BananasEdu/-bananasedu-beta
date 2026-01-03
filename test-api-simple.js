
// Simple API Test Script
const url = 'https://script.google.com/macros/s/AKfycbyM3_zw_x29CGos_Q6TKjTNB678W9kR1g25YMOklQiLPaH5MuCvk0fkOAFdbdNfy783/exec';

console.log('Testing Connectivity to: ' + url);

fetch(url, {
    method: 'GET',
    redirect: 'follow'
})
    .then(response => response.json())
    .then(data => {
        console.log('✅ Status:', data.success ? 'SUCCESS' : 'FAILED');
        console.log('📄 Message:', data.message);
        if (data.success) {
            console.log('🎉 Backend is ONLINE and ready!');
        }
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
    });

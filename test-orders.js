// Test script to verify order management fixes

// Test 1: Valid order update
console.log('Test 1: Valid order update');
const validOrder = {
    id: 1,
    email: "aliciatangweishan@gmail.com",
    total: 5.98,
    games: [
        {
            gameId: 205690,
            title: "1000 amps",
            quantity: 1,
            price: 4.99
        }
    ]
};

fetch('http://localhost:3001/api/orders', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validOrder)
})
.then(res => res.json())
.then(data => console.log('Valid order result:', data))
.catch(err => console.error('Valid order error:', err));

// Test 2: Invalid order update (should fail with validation error)
console.log('Test 2: Invalid order update');
const invalidOrder = {
    id: 1,
    email: "aliciatangweishan@gmail.com",
    total: 5.98,
    games: [
        {
            gameId: 0,
            title: "",
            quantity: 1,
            price: 0
        }
    ]
};

fetch('http://localhost:3001/api/orders', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidOrder)
})
.then(res => res.json())
.then(data => console.log('Invalid order result:', data))
.catch(err => console.error('Invalid order error:', err));

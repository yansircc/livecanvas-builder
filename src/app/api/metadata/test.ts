/**
 * Test script for the metadata API endpoint
 * Run with: bun src/app/api/metadata/test.ts
 */

async function testMetadataAPI() {
  console.log('Testing metadata API endpoint...')

  // Sample HTML content
  const sampleHTML = `
<section class="container py-5">
  <div class="row">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <img src="/images/placeholder/1.svg" class="card-img-top" alt="Product Image">
        <div class="card-body">
          <h5 class="card-title" editable="inline">Premium Headphones</h5>
          <p class="card-text" editable="inline">Experience crystal clear sound with our premium noise-cancelling headphones. Perfect for music lovers and professionals alike.</p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-primary">View Details</button>
              <button type="button" class="btn btn-sm btn-primary">Add to Cart</button>
            </div>
            <small class="text-muted">$299.99</small>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card shadow-sm">
        <img src="/images/placeholder/2.svg" class="card-img-top" alt="Product Image">
        <div class="card-body">
          <h5 class="card-title" editable="inline">Wireless Earbuds</h5>
          <p class="card-text" editable="inline">Compact, comfortable, and with exceptional battery life. Our wireless earbuds are perfect for your active lifestyle.</p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-primary">View Details</button>
              <button type="button" class="btn btn-sm btn-primary">Add to Cart</button>
            </div>
            <small class="text-muted">$149.99</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  `

  try {
    // Test initial metadata generation
    console.log('\n1. Testing initial metadata generation:')
    const initialResponse = await fetch('http://localhost:3000/api/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        htmlContent: sampleHTML,
      }),
    })

    if (!initialResponse.ok) {
      throw new Error(`API request failed with status ${initialResponse.status}`)
    }

    const initialData = await initialResponse.json()
    console.log('Initial metadata:')
    console.log(JSON.stringify(initialData, null, 2))

    // Test regeneration
    console.log('\n2. Testing metadata regeneration:')
    const regenerateResponse = await fetch('http://localhost:3000/api/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        htmlContent: sampleHTML,
        regenerate: true,
      }),
    })

    if (!regenerateResponse.ok) {
      throw new Error(`API request failed with status ${regenerateResponse.status}`)
    }

    const regeneratedData = await regenerateResponse.json()
    console.log('Regenerated metadata:')
    console.log(JSON.stringify(regeneratedData, null, 2))

    console.log('\n✅ Test completed successfully')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testMetadataAPI().catch(console.error)

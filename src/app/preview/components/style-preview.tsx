// src/app/preview/components/style-preview.tsx
'use client'

export function StylePreview() {
  return (
    <div className="p-4">
      <h1 className="mb-3 text-3xl">Style Preview</h1>
      <p className="mb-4">Change the customization options above to see live updates.</p>

      <div className="mb-5">
        <h2 className="mb-2 text-xl">Typography</h2>
        <h1 className="mb-2 text-4xl">Heading 1</h1>
        <h2 className="mb-2 text-3xl">Heading 2</h2>
        <h3 className="mb-2 text-2xl">Heading 3</h3>
        <p className="mb-2">
          Regular paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        <a href="#" className="text-primary">
          This is a link
        </a>
      </div>

      <div className="mb-5">
        <h2 className="mb-3 text-xl">Buttons</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-outline-primary">Outline Button</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-sm btn-primary">Small</button>
          <button className="btn btn-primary">Medium</button>
          <button className="btn btn-lg btn-primary">Large</button>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="mb-3 text-xl">Colors</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="bg-primary rounded p-4 text-white">Primary</div>
          <div className="bg-secondary rounded p-4 text-white">Secondary</div>
          <div className="border-primary text-primary rounded border p-4">Primary Border</div>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="mb-3 text-xl">Images</h2>
        <div className="row">
          <div className="col-md-4 mb-3">
            <img src="/images/placeholder/1.svg" alt="Nature" className="img-fluid mb-2" />
            <p className="text-muted text-sm">Nature Image</p>
          </div>
          <div className="col-md-4 mb-3">
            <img src="/images/placeholder/2.svg" alt="City" className="img-fluid mb-2" />
            <p className="text-muted text-sm">City Image</p>
          </div>
          <div className="col-md-4 mb-3">
            <img src="/images/placeholder/3.svg" alt="People" className="img-fluid mb-2" />
            <p className="text-muted text-sm">People Image</p>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="mb-3 text-xl">Card Components</h2>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card">
              <img
                src="https://source.unsplash.com/random/300x200?technology"
                alt="Card image"
                className="card-img-top"
              />
              <div className="card-body">
                <h5 className="card-title">Card Title</h5>
                <p className="card-text">Some quick example text to build on the card title.</p>
                <button className="btn btn-primary">Button</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Feature Card</h5>
                <p className="card-text">A card without an image showing text content only.</p>
                <button className="btn btn-outline-primary">Learn More</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card text-center">
              <div className="card-header">Featured</div>
              <div className="card-body">
                <h5 className="card-title">Special Card</h5>
                <p className="card-text">With header and footer sections.</p>
                <button className="btn btn-primary">Go somewhere</button>
              </div>
              <div className="card-footer text-muted">2 days ago</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="mb-3 text-xl">Alerts and Notices</h2>
        <div className="alert alert-primary mb-2" role="alert">
          This is a primary alert — check it out!
        </div>
        <div className="alert alert-secondary mb-2" role="alert">
          This is a secondary alert — check it out!
        </div>
        <div className="alert alert-success mb-2" role="alert">
          Success! Your changes have been saved.
        </div>
      </div>
    </div>
  )
}

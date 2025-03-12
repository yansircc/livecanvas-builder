export const sampleHtmlContents: string[] = [
  // Simple card component
  `<div class="card" style="width: 18rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; font-family: Arial, sans-serif;">
    <img src="https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop" class="card-img-top" alt="Sample image" style="width: 100%; height: 200px; object-fit: cover;">
    <div class="card-body" style="padding: 1rem;">
      <h5 class="card-title" style="margin-top: 0; margin-bottom: 0.5rem; font-weight: bold; font-size: 1.25rem;">Card title</h5>
      <p class="card-text" style="margin-bottom: 1rem; color: #666;">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
      <a href="#" class="btn btn-primary" style="display: inline-block; background-color: #0d6efd; color: white; text-decoration: none; padding: 0.375rem 0.75rem; border-radius: 0.25rem; border: none;">Go somewhere</a>
    </div>
  </div>`,

  // Responsive pricing table
  `<div class="pricing-container" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
    <h2 style="text-align: center; margin-bottom: 40px; color: #333;">Pricing Plans</h2>
    <div class="pricing-grid" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
      <div class="pricing-card" style="flex: 1; min-width: 250px; max-width: 350px; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
        <div class="pricing-header" style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0; color: #333; font-size: 24px;">Basic</h3>
          <div class="price" style="font-size: 36px; font-weight: bold; margin: 15px 0; color: #0d6efd;">$9<span style="font-size: 16px; font-weight: normal; color: #666;">/month</span></div>
        </div>
        <div class="pricing-features" style="padding: 20px;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✅ 5 Projects</li>
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✅ 20GB Storage</li>
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✅ Basic Support</li>
            <li style="padding: 10px 0;">❌ Advanced Features</li>
          </ul>
          <button style="display: block; width: 100%; background-color: #0d6efd; color: white; border: none; border-radius: 5px; padding: 12px; margin-top: 20px; font-size: 16px; cursor: pointer;">Choose Plan</button>
        </div>
      </div>
      <div class="pricing-card" style="flex: 1; min-width: 250px; max-width: 350px; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); transition: transform 0.3s ease; transform: scale(1.05);">
        <div class="pricing-header" style="background-color: #0d6efd; padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0; color: white; font-size: 24px;">Pro</h3>
          <div class="price" style="font-size: 36px; font-weight: bold; margin: 15px 0; color: white;">$29<span style="font-size: 16px; font-weight: normal; opacity: 0.8;">/month</span></div>
        </div>
        <div class="pricing-features" style="padding: 20px;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✅ 20 Projects</li>
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✅ 50GB Storage</li>
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✅ Priority Support</li>
            <li style="padding: 10px 0;">✅ Advanced Features</li>
          </ul>
          <button style="display: block; width: 100%; background-color: #0d6efd; color: white; border: none; border-radius: 5px; padding: 12px; margin-top: 20px; font-size: 16px; cursor: pointer;">Choose Plan</button>
        </div>
      </div>
      <div class="pricing-card" style="flex: 1; min-width: 250px; max-width: 350px; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
        <div class="pricing-header" style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0; color: #333; font-size: 24px;">Enterprise</h3>
          <div class="price" style="font-size: 36px; font-weight: bold; margin: 15px 0; color: #0d6efd;">$99<span style="font-size: 16px; font-weight: normal; color: #666;">/month</span></div>
        </div>
        <div class="pricing-features" style="padding: 20px;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✅ Unlimited Projects</li>
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✅ 200GB Storage</li>
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">✅ 24/7 Support</li>
            <li style="padding: 10px 0;">✅ Custom Features</li>
          </ul>
          <button style="display: block; width: 100%; background-color: #0d6efd; color: white; border: none; border-radius: 5px; padding: 12px; margin-top: 20px; font-size: 16px; cursor: pointer;">Choose Plan</button>
        </div>
      </div>
    </div>
  </div>`,

  // Contact form
  `<div class="contact-form" style="max-width: 500px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 8px;">
    <h2 style="text-align: center; color: #333; margin-bottom: 20px;">Contact Us</h2>
    <form>
      <div class="form-group" style="margin-bottom: 15px;">
        <label for="name" style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
        <input type="text" id="name" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
      </div>
      <div class="form-group" style="margin-bottom: 15px;">
        <label for="email" style="display: block; margin-bottom: 5px; font-weight: bold;">Email</label>
        <input type="email" id="email" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
      </div>
      <div class="form-group" style="margin-bottom: 15px;">
        <label for="subject" style="display: block; margin-bottom: 5px; font-weight: bold;">Subject</label>
        <input type="text" id="subject" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
      </div>
      <div class="form-group" style="margin-bottom: 15px;">
        <label for="message" style="display: block; margin-bottom: 5px; font-weight: bold;">Message</label>
        <textarea id="message" rows="5" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"></textarea>
      </div>
      <button type="submit" style="background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%;">Submit</button>
    </form>
  </div>`,

  // Feature section
  `<section class="features" style="padding: 60px 20px; background-color: #f9f9f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div class="container" style="max-width: 1200px; margin: 0 auto;">
      <h2 style="text-align: center; margin-bottom: 50px; color: #333; font-size: 32px;">Our Features</h2>
      <div class="features-grid" style="display: flex; flex-wrap: wrap; gap: 30px; justify-content: center;">
        <div class="feature-card" style="flex: 1; min-width: 300px; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center;">
          <div class="icon" style="margin-bottom: 20px; font-size: 48px; color: #0d6efd;">🚀</div>
          <h3 style="margin-bottom: 15px; color: #333; font-size: 24px;">Lightning Fast</h3>
          <p style="color: #666; line-height: 1.6;">Our platform is optimized for speed, ensuring your projects load quickly and efficiently.</p>
        </div>
        <div class="feature-card" style="flex: 1; min-width: 300px; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center;">
          <div class="icon" style="margin-bottom: 20px; font-size: 48px; color: #0d6efd;">🔒</div>
          <h3 style="margin-bottom: 15px; color: #333; font-size: 24px;">Secure</h3>
          <p style="color: #666; line-height: 1.6;">Security is our priority. Your data is encrypted and protected with the latest technologies.</p>
        </div>
        <div class="feature-card" style="flex: 1; min-width: 300px; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center;">
          <div class="icon" style="margin-bottom: 20px; font-size: 48px; color: #0d6efd;">📱</div>
          <h3 style="margin-bottom: 15px; color: #333; font-size: 24px;">Responsive</h3>
          <p style="color: #666; line-height: 1.6;">All our templates are fully responsive and look great on any device or screen size.</p>
        </div>
      </div>
    </div>
  </section>`,

  // Testimonial slider
  `<div class="testimonials" style="padding: 40px 20px; background-color: #f8f9fa; font-family: Arial, sans-serif;">
    <div class="container" style="max-width: 800px; margin: 0 auto; text-align: center;">
      <h2 style="margin-bottom: 30px; color: #333;">What Our Customers Say</h2>
      <div class="testimonial-card" style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <div class="quote" style="font-size: 18px; color: #555; line-height: 1.6; margin-bottom: 20px;">
          "This platform has completely transformed how we build our websites. The templates are beautiful and the customer support is outstanding!"
        </div>
        <div class="author" style="display: flex; align-items: center; justify-content: center;">
          <img src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="John Doe" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 15px;">
          <div class="author-info">
            <div class="name" style="font-weight: bold; color: #333;">John Doe</div>
            <div class="title" style="font-size: 14px; color: #777;">CEO, TechCorp</div>
          </div>
        </div>
      </div>
      <div class="testimonial-nav" style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button style="width: 12px; height: 12px; border-radius: 50%; background-color: #0d6efd; border: none;"></button>
        <button style="width: 12px; height: 12px; border-radius: 50%; background-color: #ddd; border: none;"></button>
        <button style="width: 12px; height: 12px; border-radius: 50%; background-color: #ddd; border: none;"></button>
      </div>
    </div>
  </div>`,
]

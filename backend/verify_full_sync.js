import { User, Url, Click, sequelize } from './src/models/index.js';

async function verifyAll() {
  try {
    console.log('--- 🧪 End-to-End Identity Verification ---');

    console.log('\n1. Testing User creation...');
    const user = await User.create({
      email: `test_v2_${Date.now()}@example.com`,
      name: 'Verify User',
      provider: 'local',
      isVerified: false
    });
    console.log(`✅ User created with ID: ${user.id} (${typeof user.id})`);

    console.log('\n2. Testing Url creation...');
    const url = await Url.create({
      userId: user.id,
      shortCode: `v2_${Math.random().toString(36).substring(2, 6)}`,
      originalUrl: 'https://example.com'
    });
    console.log(`✅ Url created with ID: ${url.id} (${typeof url.id})`);

    console.log('\n3. Testing Click creation...');
    const click = await Click.create({
      urlId: url.id,
      ipAddress: '127.0.0.1',
      deviceType: 'Desktop'
    });
    console.log(`✅ Click created with ID: ${click.id} (${typeof click.id})`);

    console.log('\n--- 🎉 All creations successful! ---');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await click.destroy();
    await url.destroy();
    await user.destroy();
    console.log('✅ Cleanup finished.');

  } catch (err) {
    console.error('\n❌ Verification failed:', err.message);
    if (err.parent) {
      console.error('SQL:', err.parent.query);
      console.error('Parameters:', err.parent.parameters);
    }
  } finally {
    await sequelize.close();
  }
}

verifyAll();

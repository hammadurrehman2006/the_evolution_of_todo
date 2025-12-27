import { test, expect } from '@playwright/test';

test.describe('T030 - User Registration and Todo Access Flow', () => {
  test('should allow new user to register and access their personal todo list', async ({ page }) => {
    // Generate unique email for test to avoid conflicts
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testUsername = `testuser_${Date.now()}`;

    // 1. Navigate to the registration page
    await page.goto('/register');

    // 2. Fill in registration form
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByLabel('Username').fill(testUsername);

    // 3. Submit registration form
    await page.getByRole('button', { name: 'Register' }).click();

    // 4. Verify successful registration and redirect to todo page
    await expect(page).toHaveURL(/.*\/todos/);
    await expect(page.getByText('Welcome')).toBeVisible();

    // 5. Verify user can add a todo
    await page.getByPlaceholder('Add a new todo...').fill('Test todo for registration flow');
    await page.getByRole('button', { name: 'Add Todo' }).click();

    // 6. Verify todo appears in the list
    await expect(page.getByText('Test todo for registration flow')).toBeVisible();

    // 7. Log out to test data isolation
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should ensure data isolation between different users', async ({ page, browser }) => {
    // Create first user
    const testEmail1 = `firstuser_${Date.now()}@example.com`;
    const testPassword1 = 'Password123!';
    const testUsername1 = `firstuser_${Date.now()}`;

    // Register first user and add a todo
    await page.goto('/register');
    await page.getByLabel('Email').fill(testEmail1);
    await page.getByLabel('Password').fill(testPassword1);
    await page.getByLabel('Username').fill(testUsername1);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/.*\/todos/);
    await page.getByPlaceholder('Add a new todo...').fill('First user todo');
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await expect(page.getByText('First user todo')).toBeVisible();

    // Log out first user
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/login');

    // Create second user in a new browser context to ensure complete isolation
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    const testEmail2 = `seconduser_${Date.now()}@example.com`;
    const testPassword2 = 'Password123!';
    const testUsername2 = `seconduser_${Date.now()}`;

    // Register second user
    await page2.goto('/register');
    await page2.getByLabel('Email').fill(testEmail2);
    await page2.getByLabel('Password').fill(testPassword2);
    await page2.getByLabel('Username').fill(testUsername2);
    await page2.getByRole('button', { name: 'Register' }).click();

    await expect(page2).toHaveURL(/.*\/todos/);

    // Verify second user cannot see first user's todo
    await expect(page2.getByText('First user todo')).not.toBeVisible();

    // Add a todo for the second user
    await page2.getByPlaceholder('Add a new todo...').fill('Second user todo');
    await page2.getByRole('button', { name: 'Add Todo' }).click();
    await expect(page2.getByText('Second user todo')).toBeVisible();

    await context2.close();
  });
});
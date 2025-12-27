import { test, expect } from '@playwright/test';

test.describe('T041 - Full Todo CRUD Operations', () => {
  test('should perform full CRUD operations on todos with authentication', async ({ page }) => {
    // Generate unique email for test to avoid conflicts
    const testEmail = `cruduser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testUsername = `cruduser_${Date.now()}`;

    // 1. Register a new user
    await page.goto('/register');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByLabel('Username').fill(testUsername);
    await page.getByRole('button', { name: 'Register' }).click();

    // 2. Verify successful registration and navigation to todos page
    await expect(page).toHaveURL(/.*\/todos/);

    // 3. CREATE: Add a new todo
    const newTodoText = 'Test todo for CRUD operations';
    await page.getByPlaceholder('Add a new todo...').fill(newTodoText);
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await expect(page.getByText(newTodoText)).toBeVisible();

    // 4. READ: Verify the todo exists in the list
    const todoItem = page.getByText(newTodoText);
    await expect(todoItem).toBeVisible();

    // 5. UPDATE: Mark the todo as complete
    const completeButton = page.locator('button', { hasText: 'Complete' }).first();
    await completeButton.click();

    // Wait for the update to complete and verify
    await expect(page.locator('s').getByText(newTodoText)).toBeVisible(); // Completed todos should have strikethrough

    // 6. UPDATE: Update the todo content
    const editButton = page.locator('button', { hasText: 'Edit' }).first();
    await editButton.click();

    // Wait for the edit form to appear
    const editInput = page.locator('input[type="text"]').first();
    await editInput.fill('Updated test todo for CRUD operations');
    await page.locator('button', { hasText: 'Save' }).first().click();

    // Verify the todo was updated
    await expect(page.getByText('Updated test todo for CRUD operations')).toBeVisible();
    await expect(page.getByText(newTodoText)).not.toBeVisible();

    // 7. DELETE: Delete the todo
    const deleteButton = page.locator('button', { hasText: 'Delete' }).first();
    await deleteButton.click();

    // Wait for deletion and verify todo is gone
    await expect(page.getByText('Updated test todo for CRUD operations')).not.toBeVisible();

    // 8. Verify all operations were authenticated by checking we're still logged in
    await expect(page.getByText('Logout')).toBeVisible();
  });

  test('should handle multiple todos and verify CRUD operations isolation', async ({ page }) => {
    // Generate unique email for test to avoid conflicts
    const testEmail = `multicruduser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testUsername = `multicruduser_${Date.now()}`;

    // Register user
    await page.goto('/register');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByLabel('Username').fill(testUsername);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/.*\/todos/);

    // Create multiple todos
    const todo1 = `Todo 1 - ${Date.now()}`;
    const todo2 = `Todo 2 - ${Date.now()}`;
    const todo3 = `Todo 3 - ${Date.now()}`;

    // Add first todo
    await page.getByPlaceholder('Add a new todo...').fill(todo1);
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await expect(page.getByText(todo1)).toBeVisible();

    // Add second todo
    await page.getByPlaceholder('Add a new todo...').fill(todo2);
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await expect(page.getByText(todo2)).toBeVisible();

    // Add third todo
    await page.getByPlaceholder('Add a new todo...').fill(todo3);
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await expect(page.getByText(todo3)).toBeVisible();

    // Verify all todos are present
    await expect(page.getByText(todo1)).toBeVisible();
    await expect(page.getByText(todo2)).toBeVisible();
    await expect(page.getByText(todo3)).toBeVisible();

    // Update middle todo
    const editButtons = page.locator('button', { hasText: 'Edit' });
    await editButtons.nth(1).click(); // Edit the second todo

    const editInput = page.locator('input[type="text"]').nth(1);
    await editInput.fill('Updated second todo');
    await page.locator('button', { hasText: 'Save' }).nth(1).click();

    await expect(page.getByText('Updated second todo')).toBeVisible();
    await expect(page.getByText(todo2)).not.toBeVisible();

    // Mark first todo as complete
    const completeButtons = page.locator('button', { hasText: 'Complete' });
    await completeButtons.first().click();
    await expect(page.locator('s').getByText(todo1)).toBeVisible();

    // Delete the last todo
    const deleteButtons = page.locator('button', { hasText: 'Delete' });
    await deleteButtons.last().click();
    await expect(page.getByText(todo3)).not.toBeVisible();

    // Verify remaining todos
    await expect(page.getByText(todo1)).toBeVisible(); // Completed
    await expect(page.getByText('Updated second todo')).toBeVisible(); // Active
    await expect(page.getByText(todo3)).not.toBeVisible(); // Deleted
  });
});
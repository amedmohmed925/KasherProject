# Product Image Upload System

This document describes the image upload functionality for products in the Kasher Project.

## Overview

The system now supports image uploads for products using Cloudinary for cloud storage and optimization. Images are automatically optimized, compressed, and stored in organized folders.

## Features

- **Cloud Storage**: Images are stored on Cloudinary with automatic optimization
- **Image Validation**: Only image files are accepted (jpg, png, gif, etc.)
- **Size Limits**: Maximum file size of 5MB per image
- **Automatic Optimization**: Images are automatically compressed and optimized
- **Old Image Cleanup**: When updating images, old images are automatically deleted
- **Folder Organization**: Images are organized in dedicated folders on Cloudinary

## API Endpoints

### 1. Add Product with Image

**POST** `/api/admin/products`

**Content-Type**: `multipart/form-data`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Fields**:
- `name` (string, required): Product name
- `sku` (string, required): Product SKU
- `originalPrice` (number, required): Original price
- `sellingPrice` (number, required): Selling price
- `quantity` (number, required): Quantity in stock
- `categoryId` (string, required): MongoDB ObjectId of the category
- `description` (string, optional): Product description
- `image` (file, optional): Product image file (max 5MB)

**Example Response**:
```json
{
  "success": true,
  "message": "تم إضافة المنتج بنجاح",
  "product": {
    "_id": "ObjectId",
    "name": "Product Name",
    "sku": "PRD-001",
    "originalPrice": 100,
    "sellingPrice": 120,
    "quantity": 50,
    "categoryId": "CategoryObjectId",
    "description": "Product description",
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/abcd1234.jpg",
    "adminId": "AdminObjectId",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Update Product

**PUT** `/api/admin/products/:id`

**Content-Type**: `application/json`

All fields are optional. Only provided fields will be updated.

**Body**:
```json
{
  "name": "Updated Product Name",
  "sku": "PRD-002",
  "originalPrice": 110,
  "sellingPrice": 130,
  "quantity": 45,
  "categoryId": "NewCategoryObjectId",
  "description": "Updated description"
}
```

### 3. Update Product Image Only

**PUT** `/api/admin/products/:id/image`

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `image` (file, required): New product image file (max 5MB)

**Example Response**:
```json
{
  "success": true,
  "message": "تم تحديث صورة المنتج بنجاح",
  "product": {
    "_id": "ObjectId",
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/new-image.jpg",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Frontend Implementation Examples

### 1. Add Product with Image (HTML Form)

```html
<form id="addProductForm" enctype="multipart/form-data">
  <input type="text" name="name" placeholder="اسم المنتج" required>
  <input type="text" name="sku" placeholder="رمز المنتج" required>
  <input type="number" name="originalPrice" placeholder="السعر الأصلي" required>
  <input type="number" name="sellingPrice" placeholder="سعر البيع" required>
  <input type="number" name="quantity" placeholder="الكمية" required>
  <select name="categoryId" required>
    <option value="">اختر الفئة</option>
    <!-- Category options -->
  </select>
  <textarea name="description" placeholder="الوصف"></textarea>
  <input type="file" name="image" accept="image/*">
  <button type="submit">إضافة المنتج</button>
</form>
```

### 2. JavaScript (Fetch API)

```javascript
// Add product with image
async function addProduct(formData) {
  try {
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // FormData object with image
    });
    
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Update product image only
async function updateProductImage(productId, imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await fetch(`/api/admin/products/${productId}/image`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 3. React Example

```jsx
import React, { useState } from 'react';

function AddProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    originalPrice: '',
    sellingPrice: '',
    quantity: '',
    categoryId: '',
    description: ''
  });
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    
    if (image) {
      data.append('image', image);
    }

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input
        type="text"
        placeholder="اسم المنتج"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      {/* Other form fields */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button type="submit">إضافة المنتج</button>
    </form>
  );
}
```

## Error Handling

### Common Error Responses

```json
{
  "success": false,
  "message": "خطأ في رفع الملف",
  "errors": [
    {
      "field": "image",
      "message": "يجب أن يكون الملف صورة فقط"
    }
  ]
}
```

### Validation Errors

- **File Type**: "يجب أن يكون الملف صورة فقط"
- **File Size**: File size exceeds 5MB limit
- **Required Fields**: "اسم المنتج مطلوب", "رمز المنتج مطلوب", etc.
- **Category**: "معرف الفئة مطلوب" or "معرف الفئة غير صحيح"

## Technical Details

### Cloudinary Configuration

The system uses Cloudinary for image storage with the following configuration:

- **Folder**: `products/` - All product images are stored in this folder
- **Transformation**: Automatic optimization and compression
- **Format**: Auto-format for best performance
- **Quality**: Auto-quality for optimal file size

### File Upload Process

1. **Client Upload**: Client sends multipart form data with image
2. **Server Validation**: Server validates file type and size
3. **Cloudinary Upload**: Image is uploaded to Cloudinary with optimization
4. **Database Save**: Product data with image URL is saved to MongoDB
5. **Response**: Success response with product data including image URL

### Image URL Format

Cloudinary URLs follow this pattern:
```
https://res.cloudinary.com/{cloud_name}/image/upload/v{timestamp}/products/{public_id}.{format}
```

Example:
```
https://res.cloudinary.com/kasher-project/image/upload/v1704067200/products/product_abc123.jpg
```

## Best Practices

1. **Always validate file types** on both client and server side
2. **Implement proper error handling** for upload failures
3. **Show upload progress** for better user experience
4. **Optimize images** before upload when possible
5. **Use proper loading states** during upload
6. **Handle network timeouts** gracefully
7. **Implement retry logic** for failed uploads

## Security Considerations

- File type validation prevents malicious file uploads
- File size limits prevent DoS attacks
- Cloudinary provides additional security layers
- Authentication required for all upload operations
- Admin-only access ensures proper authorization

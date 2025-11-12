# Verify S3 Upload - Step by Step

## ⚠️ Important Understanding

The `publicUrl` you receive from the backend is **generated BEFORE the file is uploaded**. It's the URL where the file **WILL be accessible** after you upload it to S3.

## 🔍 How to Verify if File Was Actually Uploaded

### Step 1: Check if File Exists in S3

The backend generated a presigned URL, but **you need to actually upload the file** using that presigned URL. Let's verify:

#### Option A: Test via Browser Console

1. **Open your browser console** (F12)
2. **Paste this script** (replace with your actual presigned URL):

```javascript
// Your presigned URL from the backend response
const presignedUrl = "https://art-gallery-s3-bucket.s3.us-east-1.amazonaws.com/images/ca593c97-6a3f-45fe-badf-662cf24f1a0b.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIATQBPNICJMGNJPMVX%2F20251109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251109T060830Z&X-Amz-Expires=3600&X-Amz-Signature=1f46b3fd747ee98cd34f811d44796e297e8943bec7d9386faec5220e3e223636&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject";

const publicUrl = "https://art-gallery-s3-bucket.s3.us-east-1.amazonaws.com/images/ca593c97-6a3f-45fe-badf-662cf24f1a0b.jpg";

// Step 1: Create a test file
const testContent = "This is a test image file";
const testFile = new File([testContent], "test-image.jpg", {
  type: "image/jpeg",
});

console.log("📁 Test file created:", testFile.name, testFile.size, "bytes");

// Step 2: Upload to S3 using presigned URL
console.log("⬆️ Uploading to S3...");
fetch(presignedUrl, {
  method: "PUT",
  body: testFile,
  headers: {
    "Content-Type": "image/jpeg",
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    console.log("✅ Upload successful! Status:", response.status);
    
    // Step 3: Verify file is accessible
    console.log("🔍 Verifying file access...");
    return fetch(publicUrl, { method: "HEAD" });
  })
  .then((response) => {
    if (response.ok) {
      console.log("✅ File is accessible at:", publicUrl);
      console.log("📊 File size:", response.headers.get("content-length"), "bytes");
      console.log("📄 Content type:", response.headers.get("content-type")");
    } else {
      console.log("⚠️ File may not be publicly accessible:", response.status);
      console.log("   This could mean:");
      console.log("   - Bucket is not configured for public read");
      console.log("   - File was uploaded but bucket is private");
    }
  })
  .catch((error) => {
    console.error("❌ Error:", error);
  });
```

#### Option B: Test via curl

```bash
# Create a test file
echo "Test image content" > test-image.jpg

# Upload to S3 using presigned URL
curl -X PUT \
  "YOUR_PRESIGNED_URL_HERE" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test-image.jpg

# Verify file is accessible
curl -I "YOUR_PUBLIC_URL_HERE"
```

#### Option C: Use Backend Test Script

1. **Run the test script** I created:

```bash
cd art-gallery-backend
npx ts-node test-s3-upload.ts
```

This will check if the file exists in your S3 bucket.

### Step 2: Check AWS S3 Console

1. **Go to AWS S3 Console**: https://s3.console.aws.amazon.com/
2. **Navigate to your bucket**: `art-gallery-s3-bucket`
3. **Check the `images/` folder**
4. **Look for**: `ca593c97-6a3f-45fe-badf-662cf24f1a0b.jpg`

If the file is there → ✅ Upload was successful
If the file is NOT there → ❌ Upload failed or never happened

### Step 3: Test Public URL Access

Try accessing the public URL directly in your browser:
```
https://art-gallery-s3-bucket.s3.us-east-1.amazonaws.com/images/ca593c97-6a3f-45fe-badf-662cf24f1a0b.jpg
```

- **If you see the file** → ✅ Upload successful AND bucket is public
- **If you get 403 Forbidden** → ✅ Upload successful BUT bucket is private
- **If you get 404 Not Found** → ❌ File was NOT uploaded

## 🔄 Complete Upload Flow

Here's what should happen:

1. **Backend generates presigned URL** ✅ (You have this)
   - Returns: `presignedUrl`, `publicUrl`, `objectKey`
   - `publicUrl` is **predicted** - file doesn't exist yet

2. **Frontend uploads file to S3** ⚠️ (You need to do this)
   - Use `presignedUrl` with PUT method
   - Upload the actual file content
   - S3 stores the file at `objectKey`

3. **File is now accessible** ✅ (After upload)
   - `publicUrl` should now work (if bucket is public)
   - File exists at `objectKey` in S3

## 🐛 Common Issues

### Issue 1: File Not Uploaded
**Symptom**: Presigned URL generated, but file doesn't exist in S3

**Causes**:
- Frontend didn't actually upload the file
- Presigned URL expired before upload
- CORS error prevented upload
- Network error during upload

**Solution**: Check browser console for errors, verify upload actually happened

### Issue 2: Public URL Returns 403
**Symptom**: File exists in S3, but public URL returns 403 Forbidden

**Causes**:
- Bucket is not configured for public read access
- Bucket policy doesn't allow public access

**Solution**: Configure bucket for public read OR use presigned download URLs

### Issue 3: Public URL Returns 404
**Symptom**: Public URL returns 404 Not Found

**Causes**:
- File was never uploaded
- Wrong objectKey
- Wrong bucket name

**Solution**: Verify file exists in S3 console, check objectKey matches

## ✅ Verification Checklist

- [ ] Presigned URL generated (you have this ✅)
- [ ] File actually uploaded to S3 (need to verify)
- [ ] File exists in S3 bucket (check AWS console)
- [ ] Public URL is accessible (test in browser)
- [ ] File metadata is correct (size, content type)

## 🚀 Next Steps

1. **Test the upload** using one of the methods above
2. **Verify file exists** in AWS S3 console
3. **Test public URL** in browser
4. **If file doesn't exist**: Check why upload failed (CORS, network, etc.)
5. **If file exists but 403**: Configure bucket for public read OR use presigned URLs for access

## 📝 Important Notes

- **Presigned URL expires** after 1 hour (3600 seconds)
- **Public URL is just a prediction** - file must be uploaded first
- **Bucket may be private** - public URL won't work if bucket is private
- **CORS must be configured** for browser uploads to work


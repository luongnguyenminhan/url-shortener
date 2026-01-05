# Trang Chi Tiết Project

## Tổng quan
Trang chi tiết project được thiết kế theo phong cách Google Drive với layout 2 cột:
- **Bên trái**: Danh sách hình ảnh với chế độ xem Grid/List
- **Bên phải**: Thông tin chi tiết của project

## Cấu trúc Files

### Pages
- `src/modules/projects/pages/ProjectDetailPage.tsx` - Trang chính hiển thị chi tiết project

### Components
- `src/modules/projects/components/ProjectDetailInfo.tsx` - Component hiển thị thông tin project
- `src/modules/projects/components/PhotoGallery.tsx` - Component hiển thị danh sách ảnh

### Services
- `src/services/photoService.ts` - Service xử lý API liên quan đến photos

## Tính năng

### 1. Hiển thị thông tin Project
- Tiêu đề và trạng thái project
- Số lượng ảnh
- Ngày tạo, cập nhật, hết hạn
- Ghi chú của khách hàng

### 2. Quản lý Photos

#### Grid View (Mặc định)
- Hiển thị ảnh dạng lưới 3 cột
- Hover để hiện actions (select, delete)
- Hiển thị trạng thái: Đã chọn, Đã duyệt, Từ chối
- Tên file và các chip thông tin

#### List View
- Hiển thị ảnh dạng danh sách
- Thumbnail bên trái, thông tin bên phải
- Actions khi hover

### 3. Actions

#### Upload Photos
- Click button "Tải lên ảnh" hoặc FAB (mobile)
- Chọn nhiều ảnh cùng lúc
- Tự động reload sau khi upload thành công

#### Select/Unselect Photo
- Checkbox khi hover vào ảnh
- Toggle trạng thái is_selected

#### Delete Photo
- Icon xóa khi hover
- Xác nhận trước khi xóa
- Cập nhật số lượng ảnh sau khi xóa

#### View Photo Detail
- Click vào ảnh để xem chi tiết (TODO)

### 4. Navigation
- Breadcrumbs: Dự án > Tên project
- Back button
- Tự động navigate từ ProjectCard

## Routing

```typescript
// Route được thêm vào router
{
    path: "projects/:id",
    element: (
        <PrivateRoute roles={[]}>
            <ProjectDetailPage />
        </PrivateRoute>
    ),
}
```

Từ ProjectManagementPage, click vào project card sẽ navigate đến `/admin/projects/:id`

## API Endpoints Sử dụng

### Projects
- `GET /v1/projects/:id` - Lấy thông tin chi tiết project
- `PUT /v1/projects/:id` - Cập nhật project (optional)

### Photos
- `GET /v1/photos?project_id=:id` - Lấy danh sách photos của project
- `POST /v1/projects/:id/photos/upload` - Upload photos
- `PATCH /v1/photos/:id/select` - Toggle selection
- `DELETE /v1/photos/:id` - Xóa photo

## UI/UX Features

### Responsive Design
- Desktop: Layout 2 cột (8:4 ratio)
- Tablet/Mobile: Stacked layout
- FAB button xuất hiện trên mobile

### Loading States
- Skeleton loading cho project info
- Spinner cho photo gallery
- Optimistic UI updates

### Empty States
- Message khi chưa có ảnh
- Call-to-action để upload

### View Modes
- Toggle button để chuyển giữa Grid/List view
- State được lưu trong component

## Styling
Sử dụng MUI v7 với:
- Material Design principles
- Consistent spacing và typography
- Responsive breakpoints
- Theme-aware colors

## Cải tiến trong tương lai

1. **Photo Detail Modal/Page**
   - Xem ảnh full size
   - Xem các versions (original, edited)
   - Xem và thêm comments
   - Approve/Reject actions

2. **Bulk Actions**
   - Select nhiều ảnh
   - Bulk delete, approve, reject
   - Download nhiều ảnh

3. **Filters & Sort**
   - Lọc theo trạng thái (selected, approved, rejected)
   - Sort theo ngày, tên file

4. **Infinite Scroll/Pagination**
   - Load more khi scroll
   - Lazy loading images

5. **Drag & Drop Upload**
   - Kéo thả file để upload
   - Preview trước khi upload

6. **Image Comparison**
   - So sánh original vs edited
   - Slider view

## Troubleshooting

### Lỗi phổ biến

1. **Photos không hiển thị**
   - Kiểm tra API endpoint
   - Verify photo_versions có image_url

2. **Upload failed**
   - Check Content-Type: multipart/form-data
   - Verify file size limits

3. **Grid layout issues**
   - MUI v7 không hỗ trợ Grid v1 syntax
   - Sử dụng Box với flex/grid thay thế

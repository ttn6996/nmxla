# nmxla

Hệ thống ôn luyện trắc nghiệm trực tuyến môn **Nhập Môn Xử Lý Ảnh (NMXLA)** với ngân hàng 400 câu hỏi chuẩn hóa, phân loại theo chương, có đáp án và giải thích chi tiết.

Ứng dụng web tĩnh (Single Page Application) tối ưu hóa cho cả Laptop/PC và Điện thoại di động (Mobile First), thiết kế trực quan, tập trung vào trải nghiệm học tập, không dùng icon emoji và loại bỏ các hiệu ứng rườm rà.

---

## Tính năng nổi bật

### 1. Chế độ Luyện tập (Practice Mode)
- **Học theo chương:** Lựa chọn ôn tập theo từng chương cụ thể (Chương 1 đến 8) hoặc toàn bộ 400 câu hỏi.
- **Bộ lọc thông minh:** Lọc nhanh các câu *Chưa làm*, *Đã làm sai*, hoặc *Đã đánh dấu (Bookmark)*.
- **Tùy chọn phản hồi:** Bật/tắt chế độ xem đáp án và giải thích ngay khi chọn.
- **Chế độ Thẻ ghi nhớ (Flashcard):** Lật thẻ xem khái niệm trọng tâm và định nghĩa cốt lõi.
- **Xáo trộn câu hỏi (Shuffle):** Tự động đổi thứ tự câu hỏi để chống học vẹt.
- **Phím tắt nhanh trên máy tính:**
  - `A`, `B`, `C`, `D` hoặc `1`, `2`, `3`, `4`: Chọn đáp án
  - `←` / `→`: Chuyển câu trước / câu sau
  - `Space`: Ẩn / hiện giải thích chi tiết
  - `B`: Đánh dấu lưu câu hỏi quan trọng

### 2. Chế độ Thi thử (Exam Mode)
- **Tùy biến đề thi:** Chọn số lượng câu (20, 40, 50, 60 câu) và thời gian tương ứng (15 - 50 phút).
- **Đồng hồ bấm giờ thực tế:** Cảnh báo khi thời gian còn dưới 5 phút, tự động nộp bài khi hết giờ.
- **Bảng điều hướng câu hỏi:** Nhảy nhanh đến câu bất kỳ; theo dõi trực quan câu đã làm, chưa làm và câu cắm cờ (Flag).
- **Bảng điểm và phân tích kết quả:** Chấm điểm thang 10, xếp loại học tập (Xuất sắc, Giỏi, Khá, Trung bình), xem lại chi tiết các câu làm đúng/sai kèm giải thích.

### 3. Tra cứu & Ngân hàng câu hỏi (Search & Browse)
- Tìm kiếm từ khóa thời gian thực (real-time search) trên toàn bộ nội dung câu hỏi, đáp án và giải thích.
- Lọc theo chương và danh sách câu đã lưu.
- Nhấp xem nhanh đáp án mà không cần làm bài.

### 4. Thống kê & Lưu trữ tiến độ (Analytics & Storage)
- Tỷ lệ hoàn thành ngân hàng câu hỏi, tỷ lệ chính xác toàn bộ và chi tiết theo từng chương.
- Lối tắt làm lại ngay các câu hỏi đã làm sai hoặc câu đã đánh dấu.
- Dữ liệu lưu trữ tự động trên trình duyệt (`LocalStorage`), không lo mất tiến độ khi tải lại trang hoặc đóng tab.

---

## Cài đặt và chạy cục bộ (Local Development)

Yêu cầu máy tính đã cài đặt **Node.js** (phiên bản 18 trở lên).

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy môi trường phát triển (Dev Server)
npm run dev
```

Truy cập địa chỉ hiển thị trên terminal (mặc định: `http://localhost:5173/`).

---

## Đóng gói và Triển khai (Build & Deploy)

```bash
# Đóng gói sản phẩm tĩnh
npm run build
```

Mã nguồn được biên dịch vào thư mục `dist/` với đường dẫn tương đối (`base: './'`), tương thích hoàn toàn với GitHub Pages và các dịch vụ lưu trữ web tĩnh.

Dự án đã được tích hợp sẵn GitHub Actions workflow tại `.github/workflows/deploy.yml` để tự động deploy lên GitHub Pages mỗi khi push code lên nhánh `main`.

---

## Cấu trúc thư mục

```text
├── .github/workflows/deploy.yml # GitHub Actions tự động build & deploy GitHub Pages
├── question/nmxla.txt          # File câu hỏi nguồn 400 câu
├── public/                     # Static assets (.nojekyll)
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Thanh tiêu đề, dark mode, phím tắt
│   │   ├── Navigation.tsx      # Thanh điều hướng (Desktop + Mobile Bottom Bar)
│   │   ├── PracticeView.tsx    # Giao diện luyện tập & thẻ ghi nhớ
│   │   ├── ExamView.tsx        # Giao diện thi thử bấm giờ
│   │   ├── ListView.tsx        # Giao diện tra cứu & tìm kiếm
│   │   └── AnalyticsView.tsx   # Giao diện thống kê tiến độ
│   ├── data/
│   │   └── questions.json      # Dữ liệu 400 câu hỏi đã phân loại & giải thích
│   ├── utils/
│   │   └── storage.ts          # Quản lý lưu trữ LocalStorage
│   ├── App.tsx
│   ├── main.tsx
│   ├── types.ts
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

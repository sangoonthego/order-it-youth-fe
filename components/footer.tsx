export default function Footer() {
  return (
    <footer className="bg-[#fce8e7] text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-slate-900 font-bold mb-4">Về chúng mình</h3>
            <p className="text-sm text-slate-900">
              Chiến dịch Xuân Tình Nguyện chính là cơ hội để mỗi chúng ta tạo ra sự khác biệt. Đây là nơi sức trẻ được dùng để thắp sáng những điều tốt đẹp và lan tỏa giá trị tình yêu thương đến với mọi người.
            </p>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold mb-4">Liên kết</h3>
            <ul className="text-sm space-y-2 text-slate-500">
              <li>
                <a href="#" className="hover:text-slate-700 transition">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-700 transition">
                  Hoạt động
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-700 transition">
                  Cửa hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-700 transition">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold mb-4">Pháp lý</h3>
            <ul className="text-sm space-y-2 text-slate-500">
              <li>
                <a href="#" className="hover:text-slate-700 transition">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-700 transition">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-700 transition">
                  Chính sách cookie
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold mb-4">Liên hệ</h3>
            <ul className="text-sm space-y-2 text-slate-500">
              <li>Email: info@xuantinhnguyen.vn</li>
              <li>Điện thoại: (84) 1234 5678</li>
              <li>Địa chỉ: TP. Hồ Chí Minh</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-slate-700">
          <p>&copy; 2026 Xuân Tình Nguyện. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

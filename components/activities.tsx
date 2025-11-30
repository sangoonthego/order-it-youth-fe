export default function Activities() {
  const activities = [
    {
      id: 1,
      title: "Hỗ trợ trẻ em khó khăn",
      description: "Cung cấp sách vở, quần áo, đồ dùng học tập cho các em nhỏ vùng quê",
      icon: "📚",
      color: "bg-blue-100",
    },
    {
      id: 2,
      title: "Chăm sóc người già",
      description: "Thăm hỏi, giúp đỡ các cụ già neo đơn, vệ sinh môi trường",
      icon: "❤️",
      color: "bg-pink-100",
    },
    {
      id: 3,
      title: "Bảo vệ môi trường",
      description: "Dọn dẹp môi trường, trồng cây xanh, nâng cao ý thức bảo vệ thiên nhiên",
      icon: "🌱",
      color: "bg-green-100",
    },
    {
      id: 4,
      title: "Hỗ trợ giáo dục",
      description: "Tổ chức các lớp học miễn phí, dạy kỹ năng sống cho học sinh",
      icon: "🎓",
      color: "bg-yellow-100",
    },
    {
      id: 5,
      title: "Dạy tiếng anh ",
      description: "Tổ chức các lớp học miễn phí, dạy kỹ năng sống cho học sinh",
      icon: "🎓",
      color: "bg-yellow-100",
    },
  ]

  return (
    <section id="activities" className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-5xl font-bold text-gray-900 mb-4">Các hoạt động tình nguyện</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tham gia các hoạt động ý nghĩa và tạo thay đổi tích cực cho cộng đồng
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`${activity.color} p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-200`}
            >
              <div className="text-5xl mb-4">{activity.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{activity.title}</h3>
              <p className="text-gray-700 leading-relaxed">{activity.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

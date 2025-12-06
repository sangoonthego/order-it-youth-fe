export default function Activities() {
  const leaf = "#A5C858";
  const peach = "#F5B1AC";
  const softlime = "#D3E281";
  const rose = "#FCE8E7";
  const sand = "#FCEDBE";
  const light = "#FFF8E7";

  const activities = [
    {
      id: 1,
      title: "Thắp sáng đường quê",
      description: "Cải thiện điều kiện đi lại vào ban đêm tại địa bàn, đảm bảo an toàn cho người dân.",
      icon: "💡",
      color: leaf,
    },
    {
      id: 2,
      title: "Dự án xã hội",
      description: "Tổ chức buổi tuyên truyền nhằm tăng cường nhận thức của trẻ em về các loại tệ nạn xã hội. Đồng thời, tổ chức nấu ăn cho các em ăn.",
      icon: "📚",
      color: softlime,
    },
    {
      id: 3,
      title: "Đền ơn đáp nghĩa",
      description: "Thăm gặp và tặng quà cho 5 hộ gia đình Mẹ Việt Nam Anh Hùng, Hội viên Hội Cựu Chiến binh, Cựu Thanh niên Xung phong có hoàn cảnh khó khăn. ",
      icon: "❤️",
      color: peach,
    },
    {
      id: 4,
      title: "Mầm xanh tình nguyện",
      description: "Xây dựng tuyến đường hoa trang trí cảnh quan phía trước và dọn dẹp vệ sinh khuôn viên tại Nghĩa Trang Liệt Sĩ địa phương.",
      icon: "🌱",
      color: rose,
    },
    {
      id: 5,
      title: "Không gian thể thao",
      description: "Xây dựng khu vui chơi, giao lưu thể thao cho người dân địa phương tại Nhà văn hóa thôn.",
      icon: "⚽",
      color: sand,
    },
    {
      id: 6,
      title: "Đêm trao quà và giao lưu văn hóa, văn nghệ",
      description: "Tổ chức đêm giao lưu văn hóa, văn nghệ giữa tình nguyện viên và người dân địa phương, tổ chức đêm hội cho các em thiếu nhi. Trao các suất quà hỗ trợ cho các gia đình có hoàn cảnh khó khăn cũng như các em nhỏ.",
      icon: "🎁",
      color: light,
    },
  ];

  return (
    <section id="activities" className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-5xl font-bold text-[#A5C858] mb-4">
            Các hoạt động tình nguyện
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hãy mở lòng đón nhận hành trình trọn vẹn của sự cho đi. Mỗi bước chân, mỗi hành động nhân ái của bạn là phép màu thầm lặng, là một bước đệm tạo nên sự thay đổi tích cực và sâu sắc cho cuộc sống.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 transition-all duration-30">
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{ backgroundColor: activity.color }}
              className="p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-200 
                         transform hover:translate-y-[-4px] hover:scale-[1.01]"
            >
              <div className="text-5xl mb-4">{activity.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{activity.title}</h3>
              <p className="text-gray-700 leading-relaxed">{activity.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

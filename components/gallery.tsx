"use client"

import type React from "react"
import Image from "next/image"; 
import { Button } from "@/components/ui/button"

export default function Gallery() {
  const gallery = [
    {
      id: 1,
      image: "/bg3.png", 
      title: "Dấu Ấn Xuân Yêu Thương",
      desc: "Những khoảnh khắc vỡ òa niềm hạnh phúc khi chúng mình trao tặng hơn 100+ suất quà Tết ấm áp, đong đầy tình người."
    },
    {
      id: 2,
      image: "/hmm.png", 
      title: "Kết Nối Những Trái Tim Nhân Ái",
      desc: "Lòng yêu thương lan tỏa khi hàng trăm tâm hồn thiện nguyện cùng chung một nhịp đập, biến ước mơ thành hành động vĩ đại."
    },
    {
      id: 3,
      image: "/hmm.png", 
      title: "Cùng Nhau Gieo Những Mầm Xanh",
      desc: "Chúng ta cùng nhau viết nên câu chuyện xanh, dọn dẹp và bảo vệ từng hơi thở của Trái Đất, cùng tạo ra một thế giới xanh, sạch, đẹp."
    },
    {
      id: 4,
      image: "/169.png", 
      title: "Làn Sóng Tình Yêu Thương Bất Tận",
      desc: "Mỗi cử chỉ nhỏ bé, mỗi sự sẻ chia chân thành đều là những tia sáng diệu kỳ tạo nên sự đổi thay sâu sắc và lan tỏa khắp mọi nơi."
    },
  ];

  return (
    <section id="gallery" className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#A5C858] mb-4">
            Những khoảnh khắc ý nghĩa
          </h2>
          <p className="text-xl text-gray-700">
            Theo dõi những câu chuyện cảm động cùng với chúng mình
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border transition-all duration-300 bg-white shadow-md hover:shadow-xl" // Thêm shadow nhẹ
              style={{
                borderColor: "#FCEDBE" // sand
              }}
            >
              {/* */}
              <div
                className="h-64 flex items-center justify-center relative overflow-hidden" 
                style={{
                  backgroundColor: "#FCE8E7" // rose
                }}
              >
                {/* ⭐️ SỬ DỤNG IMAGE COMPONENT */}
                <Image
                  src={item.image} 
                  alt={item.title}
                  layout="fill" 
                  objectFit="cover" 
                  className="transition-transform duration-300 group-hover:scale-110" 
                />
              </div>

              {/* Hover overlay (Giữ nguyên) */}
              <div
                className="absolute inset-0 flex flex-col justify-end p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.45)"
                }}
              >
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-100">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4">Theo dõi chúng mình qua các trang mạng xã hội</p>

          <div className="flex justify-center gap-4">

            {/* leaf */}
            <a
              href="#"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition hover:scale-110"
              style={{ backgroundColor: "#A5C858" }}
            >
              f
            </a>

            {/* peach */}
            <a
              href="#"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition hover:scale-110"
              style={{ backgroundColor: "#F5B1AC" }}
            >
              IG
            </a>

            {/* softlime */}
            <a
              href="#"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition hover:scale-110"
              style={{ backgroundColor: "#D3E281" }}
            >
              X
            </a>

          </div>
        </div>

      </div>
    </section>
  );
}
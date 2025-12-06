"use client"

import { useState } from "react"
import { Download, FileText } from "lucide-react"

export default function Transparency() {
  const [showLog, setShowLog] = useState(false)

  // Brand palette
  const leaf = "#A5C858"        // Primary
  const peach = "#F5B1AC"       // Accent
  const rose = "#FCE8E7"        // Soft Background

  const fundraisingStat = {
    current: 45000000,
    goal: 100000000,
    percentage: 45,
  }

  const breakdown = [
    { category: "Giáo dục", amount: 20000000, color: leaf },
    { category: "Sức khỏe", amount: 15000000, color: peach },
    { category: "Môi trường", amount: 10000000, color: leaf },
  ]

  const logs = [
    { date: "2026-01-15", activity: "Tặng sách cho trường tiểu học Hoa Hồng", amount: "5.000.000", category: "Giáo dục" },
    { date: "2026-01-10", activity: "Hỗ trợ y tế cho bà con vùng khó khăn", amount: "8.500.000", category: "Sức khỏe" },
    { date: "2026-01-05", activity: "Trồng cây xanh tại công viên thành phố", amount: "3.200.000", category: "Môi trường" },
  ]

  const handlePrintLog = () => {
    const logContent = logs.map((log) => `${log.date} | ${log.activity} | ${log.amount}đ | ${log.category}`).join("\n")
    const element = document.createElement("a")
    element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(logContent)}`)
    element.setAttribute("download", "sao-ke.txt")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <section id="transparency" className="py-20 md:py-32 px-4 relative bg-white overflow-hidden">

      {/* Soft pastel blobs */}
      <div
        className="absolute top-28 right-16 w-80 h-80 rounded-full blur-3xl opacity-40 -z-10"
        style={{ background: rose }}
      />
      <div
        className="absolute bottom-24 left-16 w-72 h-72 rounded-full blur-3xl opacity-30 -z-10"
        style={{ background: peach }}
      />

      <div className="max-w-7xl mx-auto">

        {/* TITLE */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: leaf }}>
            Minh bạch & Báo cáo
          </h2>
          <p className="text-xl text-gray-700 font-light">
            Mọi khoản thu – chi đều được công khai rõ ràng
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT CARD */}
          <div
            className="rounded-2xl p-10 shadow-xl bg-white border"
            style={{ borderColor: rose }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: leaf }}>
                <div className="w-5 h-5 rounded-full bg-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Tiến độ quyên góp</h3>
            </div>

            <div className="mb-8">
              <div className="flex justify-between mb-2 text-gray-700 font-medium">
                <span>Đã quyên góp</span>
                <span className="font-bold text-gray-900">
                  {(fundraisingStat.current / 1000000).toFixed(0)}M / {(fundraisingStat.goal / 1000000).toFixed(0)}M
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full"
                  style={{ width: `${fundraisingStat.percentage}%`, background: leaf }}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-5">
              {breakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1 text-gray-900">
                    <span>{item.category}</span>
                    <strong style={{ color: item.color }}>
                      {(item.amount / 1000000).toFixed(0)}M
                    </strong>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ background: item.color, width: `${(item.amount / fundraisingStat.current) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CARD */}
          <div
            className="rounded-2xl p-10 shadow-xl bg-white border"
            style={{ borderColor: peach }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: peach }}
                >
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Sao kê chi tiết</h3>
              </div>

              <button
                onClick={handlePrintLog}
                className="p-2 rounded-lg text-white shadow"
                style={{ background: peach }}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            {/* LOG LIST */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {logs.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border"
                  style={{ background: rose, borderColor: peach }}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: leaf }}>
                        {entry.date}
                      </p>
                      <p className="text-gray-900 text-sm">{entry.activity}</p>
                    </div>
                    <strong style={{ color: peach }}>{entry.amount}đ</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* SHOW FULL LOG */}
            <button
              onClick={() => setShowLog(!showLog)}
              className="mt-6 w-full py-3 rounded-lg font-semibold text-gray-900"
              style={{ background: leaf }}
            >
              {showLog ? "Ẩn toàn bộ log" : "Xem toàn bộ log"}
            </button>

            {showLog && (
              <div className="mt-4 p-4 rounded-lg border" style={{ background: rose, borderColor: peach }}>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {logs.map((x) => `${x.date} | ${x.activity} | ${x.amount}đ`).join("\n")}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

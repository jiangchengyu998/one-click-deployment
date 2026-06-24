import AppKit

var canvasHeight: CGFloat = 0

struct Canvas {
    let image: NSImage
    let width: CGFloat
    let height: CGFloat

    init(width: CGFloat, height: CGFloat) {
        self.width = width
        self.height = height
        canvasHeight = height
        self.image = NSImage(size: NSSize(width: width, height: height))
        image.lockFocus()
        NSColor.white.setFill()
        NSBezierPath(rect: NSRect(x: 0, y: 0, width: width, height: height)).fill()
    }

    func finish(path: String) {
        image.unlockFocus()
        guard
            let tiff = image.tiffRepresentation,
            let rep = NSBitmapImageRep(data: tiff),
            let data = rep.representation(using: .png, properties: [.compressionFactor: 0.92])
        else {
            fatalError("Could not render \(path)")
        }
        try! data.write(to: URL(fileURLWithPath: path))
    }
}

func color(_ hex: String, _ alpha: CGFloat = 1) -> NSColor {
    var value = hex
    if value.hasPrefix("#") { value.removeFirst() }
    var int: UInt64 = 0
    Scanner(string: value).scanHexInt64(&int)
    let r = CGFloat((int >> 16) & 0xff) / 255
    let g = CGFloat((int >> 8) & 0xff) / 255
    let b = CGFloat(int & 0xff) / 255
    return NSColor(calibratedRed: r, green: g, blue: b, alpha: alpha)
}

func rect(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, _ fill: NSColor, radius: CGFloat = 0, stroke: NSColor? = nil, lineWidth: CGFloat = 1) {
    let path = NSBezierPath(roundedRect: NSRect(x: x, y: canvasHeight - y - h, width: w, height: h), xRadius: radius, yRadius: radius)
    fill.setFill()
    path.fill()
    if let stroke {
        stroke.setStroke()
        path.lineWidth = lineWidth
        path.stroke()
    }
}

func line(_ x1: CGFloat, _ y1: CGFloat, _ x2: CGFloat, _ y2: CGFloat, _ stroke: NSColor, width: CGFloat = 1) {
    let path = NSBezierPath()
    path.move(to: NSPoint(x: x1, y: canvasHeight - y1))
    path.line(to: NSPoint(x: x2, y: canvasHeight - y2))
    stroke.setStroke()
    path.lineWidth = width
    path.stroke()
}

func text(_ value: String, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, size: CGFloat = 16, weight: NSFont.Weight = .regular, color: NSColor = color("#1d2939"), align: NSTextAlignment = .left) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = align
    paragraph.lineBreakMode = .byTruncatingTail
    let font = NSFont.systemFont(ofSize: size, weight: weight)
    let attrs: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .paragraphStyle: paragraph
    ]
    NSString(string: value).draw(in: NSRect(x: x, y: canvasHeight - y - h, width: w, height: h), withAttributes: attrs)
}

func circle(_ x: CGFloat, _ y: CGFloat, _ d: CGFloat, _ fill: NSColor) {
    fill.setFill()
    NSBezierPath(ovalIn: NSRect(x: x, y: canvasHeight - y - d, width: d, height: d)).fill()
}

func pill(_ value: String, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, fill: NSColor, textColor: NSColor, iconColor: NSColor? = nil) {
    rect(x, y, w, 28, fill, radius: 14, stroke: color("#d0d5dd"))
    if let iconColor {
        circle(x + 12, y + 10, 8, iconColor)
        text(value, x + 28, y + 5, w - 34, 18, size: 12, weight: .semibold, color: textColor)
    } else {
        text(value, x + 14, y + 5, w - 28, 18, size: 12, weight: .semibold, color: textColor, align: .center)
    }
}

func browserChrome(width: CGFloat, title: String) {
    rect(0, 0, width, 64, color("#f6f8fb"), stroke: color("#d0d5dd"))
    circle(22, 24, 12, color("#ff5f57"))
    circle(42, 24, 12, color("#ffbd2e"))
    circle(62, 24, 12, color("#28ca42"))
    rect(96, 16, width - 190, 32, color("#ffffff"), radius: 8, stroke: color("#d0d5dd"))
    text(title, 112, 22, width - 220, 16, size: 12, color: color("#667085"))
}

func sidebar(_ h: CGFloat, title: String) {
    rect(0, 0, 248, h, color("#1f2937"))
    rect(0, 0, 248, 72, color("#111827"))
    rect(24, 18, 36, 36, color("#4a6ee0"), radius: 8)
    text("☁", 32, 23, 20, 20, size: 19, weight: .bold, color: .white, align: .center)
    text(title, 72, 25, 150, 18, size: 16, weight: .semibold, color: .white)
    let items = [("概览", "○"), ("应用服务", "▣"), ("数据库", "▤"), ("个人资料", "◉")]
    for (index, item) in items.enumerated() {
        let y = CGFloat(96 + index * 48)
        let active = item.0 == title || (title == "用户控制台" && index == 0)
        rect(18, y, 212, 36, active ? color("#111827") : color("#1f2937"), radius: 7)
        text(item.1, 34, y + 9, 20, 16, size: 14, color: active ? .white : color("#d1d5db"))
        text(item.0, 64, y + 9, 120, 16, size: 14, weight: active ? .semibold : .regular, color: active ? .white : color("#d1d5db"))
    }
}

func topbar(_ x: CGFloat, _ w: CGFloat) {
    rect(x, 0, w, 64, color("#ffffff"), stroke: color("#e5e7eb"))
    text("个人资料", x + w - 180, 23, 70, 18, size: 13, color: color("#344054"))
    text("退出登录", x + w - 92, 23, 70, 18, size: 13, color: color("#344054"))
}

func card(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) {
    rect(x, y, w, h, color("#ffffff"), radius: 10, stroke: color("#e5e7eb"))
}

let out = "public/images/first-deploy"

func renderRepo() {
    let c = Canvas(width: 1280, height: 820)
    browserChrome(width: 1280, title: "https://github.com/example/spring-bookstore")
    rect(0, 64, 1280, 756, color("#f6f8fa"))
    text("example / spring-bookstore", 70, 105, 420, 28, size: 24, weight: .semibold, color: color("#0969da"))
    pill("Public", 382, 106, 74, fill: color("#ffffff"), textColor: color("#57606a"))
    let tabs = ["Code", "Issues", "Pull requests", "Actions", "Projects", "Security"]
    var tx: CGFloat = 70
    for tab in tabs {
        text(tab, tx, 160, 120, 20, size: 14, weight: tab == "Code" ? .semibold : .regular, color: color("#24292f"))
        tx += tab == "Pull requests" ? 140 : 94
    }
    line(70, 190, 1210, 190, color("#d0d7de"))
    card(70, 220, 1140, 510)
    rect(70, 220, 1140, 54, color("#f6f8fa"), radius: 10, stroke: color("#d0d7de"))
    text("main", 96, 238, 80, 18, size: 14, weight: .semibold)
    text("Latest commit 8f23c7a · Add Dockerfile and production config", 230, 238, 560, 18, size: 13, color: color("#57606a"))
    let rows = [
        ("📁", "src", "Application source code", "2 hours ago"),
        ("📄", "Dockerfile", "Container build for Cloud Deploy", "2 hours ago"),
        ("📄", "pom.xml", "Spring Boot dependencies", "yesterday"),
        ("📄", "README.md", "Deployment notes and environment variables", "yesterday"),
        ("📄", ".env.example", "Database configuration example", "3 days ago")
    ]
    for (i, row) in rows.enumerated() {
        let y = CGFloat(274 + i * 64)
        line(70, y, 1210, y, color("#d8dee4"))
        text(row.0, 96, y + 22, 28, 18, size: 16)
        text(row.1, 132, y + 21, 180, 18, size: 15, weight: .semibold, color: color("#0969da"))
        text(row.2, 360, y + 21, 420, 18, size: 14, color: color("#57606a"))
        text(row.3, 1020, y + 21, 130, 18, size: 13, color: color("#57606a"))
    }
    card(70, 760, 1140, 0)
    c.finish(path: "\(out)/demo-repo.png")
}

func renderDeployApp() {
    let c = Canvas(width: 1200, height: 760)
    rect(0, 0, 1200, 760, color("#f3f4f6"))
    sidebar(760, title: "应用服务")
    topbar(248, 952)
    text("我的应用服务", 288, 104, 260, 28, size: 26, weight: .bold)
    text("配额: 1/5", 288, 140, 120, 20, size: 15, color: color("#667085"))
    rect(965, 104, 145, 40, color("#2563eb"), radius: 8)
    text("+ 部署新应用", 988, 116, 102, 18, size: 14, weight: .semibold, color: .white)
    card(288, 174, 820, 520)
    text("部署新应用", 328, 214, 200, 24, size: 22, weight: .semibold)
    let labels = ["应用名称", "Git仓库地址", "Git Token（可选）", "Git分支（可选）"]
    let values = ["bookstore", "https://github.com/example/spring-bookstore", "ghp_••••••••••••", "main"]
    for i in 0..<4 {
        let y = CGFloat(270 + i * 76)
        text(labels[i], 328, y, 180, 18, size: 14, weight: .semibold, color: color("#344054"))
        rect(328, y + 26, 700, 42, color("#ffffff"), radius: 8, stroke: color("#d0d5dd"))
        text(values[i], 344, y + 38, 650, 16, size: 14, color: color("#344054"))
    }
    text("环境变量", 328, 584, 120, 18, size: 14, weight: .semibold, color: color("#344054"))
    rect(328, 612, 242, 40, color("#ffffff"), radius: 8, stroke: color("#d0d5dd"))
    text("DB_HOST", 344, 624, 200, 16, size: 14, color: color("#344054"))
    rect(586, 612, 442, 40, color("#ffffff"), radius: 8, stroke: color("#d0d5dd"))
    text("db.example.internal", 602, 624, 250, 16, size: 14, color: color("#344054"))
    rect(856, 650, 172, 42, color("#2563eb"), radius: 8)
    text("开始部署", 906, 662, 80, 18, size: 14, weight: .semibold, color: .white)
    c.finish(path: "\(out)/first_deploy_api.png")
}

func renderDatabase() {
    let c = Canvas(width: 1200, height: 700)
    rect(0, 0, 1200, 700, color("#f3f4f6"))
    sidebar(700, title: "数据库")
    topbar(248, 952)
    text("数据库详情", 288, 104, 260, 28, size: 26, weight: .bold)
    text("默认数据库连接信息", 288, 140, 260, 20, size: 15, color: color("#667085"))
    card(288, 176, 820, 420)
    text("u8x2_bookstore", 328, 216, 260, 24, size: 22, weight: .semibold)
    pill("运行中", 940, 214, 88, fill: color("#ecfdf3"), textColor: color("#047857"), iconColor: color("#10b981"))
    let rows = [
        ("主机地址", "db.ydphoto.com"),
        ("数据库名称", "u8x2_bookstore"),
        ("用户名", "u8x2_bookstore"),
        ("数据库密码", "与注册登录密码一致")
    ]
    for (i, row) in rows.enumerated() {
        let y = CGFloat(282 + i * 68)
        text(row.0, 328, y, 160, 18, size: 14, color: color("#667085"))
        rect(328, y + 24, 560, 38, color("#f9fafb"), radius: 8, stroke: color("#e5e7eb"))
        text(row.1, 344, y + 35, 420, 16, size: 14, weight: .semibold, color: color("#1d2939"))
        rect(904, y + 24, 72, 38, color("#ffffff"), radius: 8, stroke: color("#d0d5dd"))
        text("复制", 927, y + 35, 36, 16, size: 13, color: color("#2563eb"), align: .center)
    }
    rect(328, 565, 700, 0, color("#ffffff"))
    c.finish(path: "\(out)/create-db.png")
}

func renderDBeaver() {
    let c = Canvas(width: 1200, height: 820)
    rect(0, 0, 1200, 820, color("#edf2f7"))
    card(110, 76, 980, 660)
    rect(110, 76, 980, 58, color("#f8fafc"), radius: 10, stroke: color("#d0d5dd"))
    text("MySQL 连接设置", 144, 96, 240, 24, size: 22, weight: .semibold)
    let tabs = ["主要", "驱动属性", "SSL", "网络", "高级"]
    var x: CGFloat = 144
    for tab in tabs {
        let active = tab == "驱动属性"
        rect(x, 154, active ? 112 : 82, 36, active ? color("#e8f0fe") : color("#ffffff"), radius: 8, stroke: color("#d0d5dd"))
        text(tab, x + 14, 164, active ? 84 : 54, 16, size: 13, weight: active ? .semibold : .regular, color: active ? color("#1d4ed8") : color("#344054"), align: .center)
        x += active ? 124 : 94
    }
    text("连接参数", 144, 220, 120, 20, size: 16, weight: .semibold)
    let fields = [
        ("Host", "db.ydphoto.com"),
        ("Port", "3306"),
        ("Database", "u8x2_bookstore"),
        ("Username", "u8x2_bookstore")
    ]
    for (i, f) in fields.enumerated() {
        let y = CGFloat(258 + i * 58)
        text(f.0, 156, y + 8, 110, 18, size: 14, color: color("#667085"))
        rect(280, y, 640, 36, color("#ffffff"), radius: 6, stroke: color("#d0d5dd"))
        text(f.1, 294, y + 10, 580, 16, size: 14, color: color("#1d2939"))
    }
    text("驱动属性", 144, 512, 120, 20, size: 16, weight: .semibold)
    rect(144, 548, 850, 78, color("#f8fafc"), radius: 8, stroke: color("#d0d5dd"))
    text("allowPublicKeyRetrieval", 172, 570, 250, 18, size: 14, weight: .semibold)
    text("true", 720, 570, 80, 18, size: 14, weight: .semibold, color: color("#047857"))
    text("useSSL", 172, 600, 250, 18, size: 14)
    text("false", 720, 600, 80, 18, size: 14)
    rect(832, 660, 82, 38, color("#ffffff"), radius: 8, stroke: color("#d0d5dd"))
    text("测试连接", 846, 671, 54, 16, size: 13, color: color("#344054"), align: .center)
    rect(930, 660, 64, 38, color("#2563eb"), radius: 8)
    text("完成", 948, 671, 30, 16, size: 13, weight: .semibold, color: .white, align: .center)
    c.finish(path: "\(out)/dbserver.png")
}

func renderConnectSuccess() {
    let c = Canvas(width: 1200, height: 820)
    rect(0, 0, 1200, 820, color("#f3f4f6"))
    browserChrome(width: 1200, title: "DBeaver - u8x2_bookstore")
    rect(0, 64, 280, 756, color("#ffffff"), stroke: color("#d0d5dd"))
    text("数据库导航", 24, 92, 180, 20, size: 16, weight: .semibold)
    let tree = ["▾ u8x2_bookstore", "  ▾ Tables", "    users", "    orders", "    products", "  Views", "  Procedures"]
    for (i, row) in tree.enumerated() {
        text(row, 26, CGFloat(132 + i * 32), 220, 18, size: 14, color: i == 0 ? color("#1d4ed8") : color("#344054"))
    }
    rect(280, 64, 920, 756, color("#ffffff"))
    rect(312, 96, 820, 190, color("#0f172a"), radius: 10)
    text("-- 连接成功，可以开始查询数据", 338, 126, 430, 20, size: 15, color: color("#86efac"))
    text("SELECT id, name, email, created_at", 338, 162, 470, 22, size: 17, color: color("#e0f2fe"))
    text("FROM users", 338, 196, 180, 22, size: 17, color: color("#e0f2fe"))
    text("LIMIT 5;", 338, 230, 120, 22, size: 17, color: color("#e0f2fe"))
    pill("Connected", 942, 112, 120, fill: color("#ecfdf3"), textColor: color("#047857"), iconColor: color("#10b981"))
    card(312, 324, 820, 330)
    rect(312, 324, 820, 44, color("#f8fafc"), radius: 10, stroke: color("#d0d5dd"))
    let headers = ["id", "name", "email", "created_at"]
    let starts: [CGFloat] = [342, 450, 620, 860]
    for (i, h) in headers.enumerated() {
        text(h, starts[i], 338, 160, 16, size: 13, weight: .semibold, color: color("#475467"))
    }
    let data = [
        ["1", "Alice", "alice@example.com", "2025-10-01 10:24"],
        ["2", "Bob", "bob@example.com", "2025-10-02 13:42"],
        ["3", "Carol", "carol@example.com", "2025-10-03 09:16"]
    ]
    for (r, row) in data.enumerated() {
        let y = CGFloat(368 + r * 64)
        line(312, y, 1132, y, color("#e5e7eb"))
        for (i, cell) in row.enumerated() {
            text(cell, starts[i], y + 22, i == 2 ? 210 : 160, 18, size: 14, color: color("#344054"))
        }
    }
    c.finish(path: "\(out)/connect-success.png")
}

renderRepo()
renderDeployApp()
renderDatabase()
renderDBeaver()
renderConnectSuccess()

import { useState, useRef } from "react";

const student = {
  name: "น้องพริมชิม",
  grade: "นักเรียนชั้น ม.5",
  school: "โรงเรียนพิมชิมวิทยา",
  studentId: "12345",
  lastLogin: "20 พ.ค. 2567 15:30",
  subject: "ฟิสิกส์",
  subjectEn: "Physics",
  score: 850,
  maxScore: 1000,
  rank: 3,
  totalStudents: 20,
  prevRank: 4,
  targetScore: 900,
  stars: 4,
  maxStars: 5,
};

const menuItems = [
  { icon: "👤", label: "ข้อมูลส่วนตัว" },
  { icon: "🔒", label: "เปลี่ยนรหัสผ่าน" },
  { icon: "🔔", label: "การแจ้งเตือน" },
  { icon: "❓", label: "ช่วยเหลือ" },
  { icon: "ℹ️", label: "เกี่ยวกับแอป" },
];

const DinoSVG = () => (
  <svg viewBox="0 0 120 120" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="85" rx="28" ry="22" fill="#5DCAA5"/>
    <ellipse cx="60" cy="60" rx="24" ry="26" fill="#5DCAA5"/>
    <ellipse cx="60" cy="58" rx="20" ry="22" fill="#7CE8C0"/>
    <circle cx="60" cy="42" r="18" fill="#5DCAA5"/>
    <circle cx="54" cy="38" r="5" fill="white"/>
    <circle cx="66" cy="38" r="5" fill="white"/>
    <circle cx="55" cy="39" r="2.5" fill="#26215C"/>
    <circle cx="67" cy="39" r="2.5" fill="#26215C"/>
    <ellipse cx="60" cy="47" rx="5" ry="3" fill="#9FE1CB"/>
    <path d="M56 49 Q60 52 64 49" stroke="#3C3489" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <polygon points="50,28 46,18 54,24" fill="#5DCAA5"/>
    <polygon points="60,24 57,13 64,21" fill="#5DCAA5"/>
    <ellipse cx="38" cy="78" rx="8" ry="5" fill="#5DCAA5" transform="rotate(-30 38 78)"/>
    <ellipse cx="82" cy="78" rx="8" ry="5" fill="#5DCAA5" transform="rotate(30 82 78)"/>
    <polygon points="72,55 80,50 76,60" fill="#F0997B"/>
    <circle cx="74" cy="55" r="3" fill="#FAC775" opacity="0.9"/>
    <path d="M74 53 L76 51 L77 54 Z" fill="#EF9F27"/>
  </svg>
);

const StarRating = ({ count, max }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} style={{ fontSize: 22 }}>{i < count ? "⭐" : "☆"}</span>
    ))}
  </div>
);

const ProgressBar = ({ value, max, color = "#7F77DD" }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: "#EEEDFE", borderRadius: 99, height: 10, overflow: "hidden", width: "100%" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
    </div>
  );
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');

  .profile-root {
    font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;
    background: #F3F0FF;
    min-height: 100vh;
  }

  .profile-inner {
    max-width: 520px;
    margin: 0 auto;
    padding-bottom: 80px;
  }

  /* tablet / desktop: side-by-side layout */
  @media (min-width: 768px) {
    .profile-root {
      padding: 32px 24px;
    }
    .profile-inner {
      max-width: 900px;
      display: grid;
      grid-template-columns: 340px 1fr;
      grid-template-rows: auto;
      gap: 16px;
      align-items: start;
    }
    .col-left  { grid-column: 1; display: flex; flex-direction: column; gap: 12px; }
    .col-right { grid-column: 2; display: flex; flex-direction: column; gap: 12px; }
    .profile-header { border-radius: 24px !important; padding: 24px !important; }
    .profile-card-overlap { margin: 0 !important; box-shadow: 0 4px 24px rgba(127,119,221,0.15); }
    .bottom-nav { display: none !important; }
    .desktop-nav {
      display: flex !important;
      gap: 8px;
      margin-bottom: 8px;
    }
  }

  @media (max-width: 767px) {
    .col-left, .col-right { display: contents; }
    .profile-header { border-radius: 0 0 32px 32px !important; padding: 20px 20px 60px !important; }
    .desktop-nav { display: none !important; }
  }

  .nav-tab-btn {
    flex: 1;
    padding: 10px;
    border-radius: 12px;
    border: none;
    font-family: 'Sarabun', sans-serif;
    font-size: 14px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.15s, color 0.15s;
  }
  .nav-tab-btn.active {
    background: #7F77DD;
    color: white;
  }
  .nav-tab-btn.inactive {
    background: #EEEDFE;
    color: #534AB7;
  }

  .card {
    background: white;
    border-radius: 20px;
    padding: 16px 20px;
    box-shadow: 0 4px 16px rgba(127,119,221,0.1);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  @media (max-width: 400px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .avatar-upload-btn {
    position: absolute; bottom: 0; right: 0;
    background: #7F77DD; border-radius: 50%;
    width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid white; font-size: 13px;
    cursor: pointer; padding: 0;
    box-shadow: 0 2px 8px rgba(127,119,221,0.4);
  }
  .avatar-upload-btn:hover { background: #534AB7; }

  .change-photo-btn {
    margin-top: 8px;
    background: #EEEDFE; border: none; border-radius: 99px;
    padding: 5px 14px; font-size: 12px;
    color: #534AB7; font-family: inherit;
    cursor: pointer; font-weight: 600;
    transition: background 0.15s;
  }
  .change-photo-btn:hover { background: #CECBF6; }

  .menu-item-btn {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; background: none; border: none;
    font-family: inherit; font-size: 14px; color: #26215C;
    cursor: pointer; text-align: left;
    transition: background 0.12s;
  }
  .menu-item-btn:hover { background: #F8F7FF; }

  .logout-btn {
    background: none; border: 1.5px solid #E24B4A;
    border-radius: 12px; padding: 12px 40px;
    font-size: 14px; color: #E24B4A; font-family: inherit;
    cursor: pointer; font-weight: 600;
    display: inline-flex; align-items: center; gap: 8px;
    transition: background 0.15s;
  }
  .logout-btn:hover { background: #FCEBEB; }

  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: white; border-top: 1px solid #EEEDFE;
    display: flex; justify-content: space-around;
    padding: 10px 0 16px; z-index: 50;
  }

  .bottom-nav-btn {
    background: none; border: none; font-family: inherit;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    cursor: pointer; padding: 4px 20px;
  }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }

  .modal-box {
    background: white; border-radius: 24px;
    padding: 24px; width: 100%; max-width: 340px;
    text-align: center;
  }

  .modal-confirm-btn {
    flex: 1; padding: 12px; border-radius: 12px;
    border: none; font-size: 14px; color: white;
    font-family: inherit; cursor: pointer;
    font-weight: 600; transition: background 0.2s;
  }

  .modal-cancel-btn {
    flex: 1; padding: 12px; border-radius: 12px;
    border: 1.5px solid #D3D1C7; background: none;
    font-size: 14px; color: #666; font-family: inherit; cursor: pointer;
  }
  .modal-cancel-btn:hover { background: #F1EFE8; }

  .modal-alt-btn {
    margin-top: 10px; width: 100%; padding: 10px;
    border-radius: 12px; border: 1.5px dashed #AFA9EC;
    background: #F8F7FF; font-size: 13px; color: #534AB7;
    font-family: inherit; cursor: pointer;
  }
  .modal-alt-btn:hover { background: #EEEDFE; }
`;

export default function StudentProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const scorePct = Math.round((student.score / student.maxScore) * 100);
  const targetPct = Math.min(100, Math.round((student.score / student.targetScore) * 100));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("ไฟล์ต้องมีขนาดไม่เกิน 5MB"); return; }
    setPreviewUrl(URL.createObjectURL(file));
    setShowModal(true);
    e.target.value = "";
  };

  const handleConfirm = () => {
    setUploading(true);
    // TODO: api.post("/students/avatar", formData)
    setTimeout(() => { setAvatar(previewUrl); setUploading(false); setShowModal(false); }, 1200);
  };

  const handleCancel = () => { setPreviewUrl(null); setShowModal(false); };

  const ProfileCard = () => (
    <div className="card profile-card-overlap" style={{ borderRadius: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "#EEEDFE", border: "3px solid #7F77DD",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 40 }}>👦</span>}
          </div>
          <button className="avatar-upload-btn" onClick={() => fileInputRef.current?.click()} title="เปลี่ยนรูป">📷</button>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#26215C" }}>{student.name}</span>
            <span style={{ fontSize: 14 }}>✏️</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "4px 0" }}>
            <span style={{ fontSize: 13 }}>⭐</span>
            <span style={{ fontSize: 13, color: "#534AB7", fontWeight: 600 }}>{student.grade}</span>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>🏫 {student.school}</div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>🪪 รหัส {student.studentId}</div>
          <div style={{ fontSize: 12, color: "#888" }}>🕐 เข้าระบบล่าสุด {student.lastLogin}</div>
          <button className="change-photo-btn" onClick={() => fileInputRef.current?.click()}>
            📷 เปลี่ยนรูปโปรไฟล์
          </button>
        </div>

        <div style={{ flexShrink: 0 }}><DinoSVG /></div>
      </div>
    </div>
  );

  const SubjectCard = () => (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, background: "#EEEDFE", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⚛️</div>
        <div>
          <div style={{ fontSize: 11, color: "#888" }}>รายวิชาปัจจุบัน</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#26215C" }}>{student.subject}</div>
          <div style={{ fontSize: 11, color: "#AFA9EC" }}>{student.subjectEn}</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 12 }}>
        {[
          { label: "คะแนนสะสม", value: student.score, icon: "⭐" },
          { label: "อันดับของฉัน", value: `${student.rank}/${student.totalStudents}`, icon: "🏆" },
          { label: "เป้าหมาย", value: student.targetScore, icon: "🎯" },
          { label: "ประทับตรา", value: `${student.stars}/${student.maxStars}`, icon: "🌟" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#F8F7FF", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#26215C" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#888", lineHeight: 1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 4 }}>
          <span>คะแนนสะสม</span><span style={{ color: "#7F77DD", fontWeight: 600 }}>{scorePct}%</span>
        </div>
        <ProgressBar value={student.score} max={student.maxScore} color="#7F77DD" />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 4 }}>
          <span>เป้าหมาย (เหลืออีก {student.targetScore - student.score} คะแนน)</span>
          <span style={{ color: "#5DCAA5", fontWeight: 600 }}>{targetPct}%</span>
        </div>
        <ProgressBar value={student.score} max={student.targetScore} color="#5DCAA5" />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        <div style={{ background: "#EEEDFE", borderRadius: 99, padding: "4px 10px", fontSize: 12, color: "#534AB7", fontWeight: 600 }}>
          อันดับเดิม {student.prevRank} ↑
        </div>
        <div style={{ background: "#E1F5EE", borderRadius: 99, padding: "4px 10px", fontSize: 12, color: "#0F6E56", fontWeight: 600 }}>
          ประทับตราครบแล้ว 🎁
        </div>
      </div>
    </div>
  );

  const StarsCard = () => (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 600, color: "#26215C", marginBottom: 10 }}>ประทับตรา</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <StarRating count={student.stars} max={student.maxStars} />
        <span style={{ fontSize: 13, color: "#7F77DD", fontWeight: 600 }}>สะสมใกล้ครบ 5 ดวง รับของรางวัลพิเศษ!</span>
      </div>
    </div>
  );

  const MenuCard = () => (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {menuItems.map((item, i) => (
        <div key={item.label}>
          <button className="menu-item-btn">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, background: "#EEEDFE", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {item.icon}
              </div>
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </div>
            <span style={{ color: "#AFA9EC", fontSize: 18 }}>›</span>
          </button>
          {i < menuItems.length - 1 && <div style={{ height: 1, background: "#F3F0FF", margin: "0 20px" }} />}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <style>{styles}</style>

      {/* Upload modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontSize: 16, fontWeight: 700, color: "#26215C", marginBottom: 4 }}>ตัวอย่างรูปโปรไฟล์</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>รูปจะถูกครอบเป็นวงกลม</div>
            <div style={{ width: 120, height: 120, borderRadius: "50%", overflow: "hidden", margin: "0 auto 20px", border: "4px solid #7F77DD", background: "#EEEDFE" }}>
              <img src={previewUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
              <button className="modal-cancel-btn" onClick={handleCancel}>ยกเลิก</button>
              <button
                className="modal-confirm-btn"
                style={{ background: uploading ? "#AFA9EC" : "#7F77DD", cursor: uploading ? "not-allowed" : "pointer" }}
                onClick={handleConfirm}
                disabled={uploading}
              >
                {uploading ? "กำลังบันทึก..." : "ใช้รูปนี้ ✓"}
              </button>
            </div>
            <button className="modal-alt-btn" onClick={() => fileInputRef.current?.click()}>📁 เลือกรูปอื่น</button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

      <div className="profile-root">

        {/* Desktop top nav */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 0 8px" }}>
          <div className="desktop-nav">
            {[
              { icon: "🏠", label: "หน้าแรก", id: "home" },
              { icon: "📊", label: "สถิติ", id: "stats" },
              { icon: "👤", label: "โปรไฟล์", id: "profile" },
            ].map((t) => (
              <button key={t.id}
                className={`nav-tab-btn ${activeTab === t.id ? "active" : "inactive"}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile header */}
        <div className="profile-header" style={{
          background: "linear-gradient(135deg, #7F77DD 0%, #AFA9EC 100%)",
          padding: "20px 20px 60px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "white", fontSize: 22, fontWeight: 700 }}>โปรไฟล์</span>
            <div style={{ position: "relative" }}>
              <span style={{ fontSize: 24 }}>🔔</span>
              <div style={{ position: "absolute", top: -4, right: -4, background: "#E24B4A", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>3</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="profile-inner" style={{ padding: "0 16px" }}>

          {/* Mobile: overlapping card */}
          <div className="col-left">
            <div style={{ marginTop: -45, position: "relative", zIndex: 2 }}>
              <ProfileCard />
            </div>
            <SubjectCard />
            <StarsCard />
          </div>

          <div className="col-right">
            <MenuCard />
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <button className="logout-btn"><span>↪</span> ออกจากระบบ</button>
            </div>
          </div>

        </div>

        {/* Mobile bottom nav */}
        <div className="bottom-nav">
          {[
            { icon: "🏠", label: "หน้าแรก", id: "home" },
            { icon: "📊", label: "สถิติ", id: "stats" },
            { icon: "👤", label: "โปรไฟล์", id: "profile" },
          ].map((t) => (
            <button key={t.id} className="bottom-nav-btn" onClick={() => setActiveTab(t.id)}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <span style={{ fontSize: 11, color: activeTab === t.id ? "#7F77DD" : "#888", fontWeight: activeTab === t.id ? 600 : 400 }}>{t.label}</span>
              {activeTab === t.id && <div style={{ width: 4, height: 4, background: "#7F77DD", borderRadius: "50%" }} />}
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
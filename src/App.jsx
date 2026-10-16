import React, { useState, useEffect } from "react";
import { db } from "./db";
import { useLiveQuery } from 'dexie-react-hooks';

export default function App() {
  // ---------------------------------------------------------
  // 1. IndexedDB State (Dexie) - รายการสัมภาระในกระเป๋า (Packing List)
  // ---------------------------------------------------------
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const items = useLiveQuery(() => db.items.toArray());

  const addItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await db.items.add({ name, quantity: Number(quantity) || 1 });
    setName('');
    setQuantity('');
  };

  const deleteItem = async (id) => {
    await db.items.delete(id);
  };

  // ---------------------------------------------------------
  // 2. LocalStorage State - Checklist สิ่งที่ต้องจัดการก่อนเดินทาง (Pre-Trip Checklist)
  // ---------------------------------------------------------
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (err) {
        console.error("Failed to parse local storage tasks", err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    if (e) e.preventDefault();
    if (task.trim() === "") return;
    setTasks([...tasks, { text: task, done: false }]);
    setTask("");
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  // สถิติการเตรียมตัว
  const completedCount = tasks.filter(t => t.done).length;
  const readinessPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const totalItemCount = items ? items.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Top Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-sky-500/20">
              ✈️
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white leading-tight">
                TRIP <span className="text-sky-400 font-extrabold">MATE</span>
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Travel & Packing Companion</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Offline Ready (PWA)
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Travel Readiness Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-sky-500/50 transition duration-300">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">ระดับความพร้อมเดินทาง (LocalStorage)</div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-sky-400">{readinessPercent}%</div>
              <div className="text-xs text-slate-400">{completedCount} จาก {tasks.length} ขั้นตอนเสร็จสิ้น</div>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-500 rounded-full" 
                style={{ width: `${readinessPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/50 transition duration-300">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">สัมภาระในกระเป๋า (IndexedDB)</div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-emerald-400">{items?.length || 0} <span className="text-lg font-normal text-slate-400">หมวดหมู่</span></div>
              <div className="text-xs text-slate-400">รวม {totalItemCount} ชิ้น</div>
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-2 flex items-center gap-1">
              <span>●</span> บันทึกแล้วใน IndexedDB
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">ระบบจัดเก็บข้อมูลทริป</div>
            <div className="flex items-center gap-2 my-2">
              <div className="px-2.5 py-1 bg-sky-500/10 text-sky-400 rounded-lg text-xs border border-sky-500/20 font-mono">Checklist: LocalStorage</div>
              <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs border border-emerald-500/20 font-mono">Luggage: IndexedDB</div>
            </div>
            <div className="text-xs text-slate-500">
              ข้อมูลถูกบันทึกลงเบราว์เซอร์อัตโนมัติ ไม่หายเมื่อปิดหน้าเว็บ
            </div>
          </div>

        </div>

        {/* Workspace Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Pre-Trip Checklist (LocalStorage) */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🗺️</span> สิ่งที่ต้องทำก่อนเดินทาง
                </h2>
                <p className="text-xs text-slate-400 mt-1">Pre-Trip Checklist (บันทึกใน LocalStorage)</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg font-mono">
                {tasks.length} รายการ
              </span>
            </div>

            {/* Input Form */}
            <form onSubmit={addTask} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="เช่น จองโรงแรม, ทำประกันเดินทาง, เช็กอิน..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-white placeholder-slate-500 transition"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-5 py-3 rounded-xl transition shadow-lg shadow-sky-600/25 active:scale-95 text-sm flex items-center gap-1"
              >
                <span>+</span> เพิ่ม
              </button>
            </form>

            {/* Task List */}
            <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[380px] pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
                  ยังไม่มีรายการเตรียมตัว เพิ่มขั้นตอนแรกของคุณเลย!
                </div>
              ) : (
                tasks.map((t, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                      t.done
                        ? "bg-slate-950/40 border-slate-900 text-slate-500"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-200 hover:border-slate-600"
                    }`}
                  >
                    <span
                      onClick={() => toggleTask(index)}
                      className={`cursor-pointer flex-1 text-sm font-medium mr-3 select-none ${
                        t.done ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {t.text}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTask(index)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                          t.done
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                        }`}
                      >
                        {t.done ? "✓ Done" : "Mark"}
                      </button>
                      <button
                        onClick={() => deleteTask(index)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 transition text-xs rounded-lg hover:bg-rose-500/10"
                        title="ลบรายการ"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Packing List (IndexedDB) */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🧳</span> จัดกระเป๋าสัมภาระ
                </h2>
                <p className="text-xs text-slate-400 mt-1">Packing Inventory (บันทึกใน IndexedDB / Dexie)</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-mono">
                IndexedDB
              </span>
            </div>

            {/* Form */}
            <form onSubmit={addItem} className="space-y-3 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="ของที่ต้องเอาไป เช่น เสื้อยืด, พาสปอร์ต"
                  className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="จำนวน"
                  className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium p-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-95 text-sm flex items-center justify-center gap-1"
              >
                + บันทึกใส่กระเป๋า
              </button>
            </form>

            {/* Inventory List */}
            <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[300px] pr-1">
              {!items || items.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
                  กระเป๋ายังว่างอยู่ เพิ่มสิ่งของที่จะขนไปทริปนี้ได้เลย!
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-2xl hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/20">
                        #{item.id}
                      </div>
                      <span className="font-medium text-sm text-slate-100">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl text-xs font-semibold">
                        x {item.quantity}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 transition text-xs rounded-lg hover:bg-rose-500/10"
                        title="ลบทิ้ง"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800/60 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500 tracking-wider">
            66110124 Suttinat Kaewdee    
          </p>
        </div>
      </footer>

    </div>
  );
}
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// Thay thế các thông số bên dưới bằng thông tin thật từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBsxyF9NSE8DgkpZqRt_8uwMfM8pxykwwE", // <--- Đảm bảo Key này là Key mới nhất
  authDomain: "mychatapp-d1880.firebaseapp.com",
  projectId: "mychatapp-d1880",
  storageBucket: "mychatapp-d1880.firebasestorage.app",
  messagingSenderId: "611062801464",
  appId: "1:611062801464:web:fca21902c8c9da030872cd",
  measurementId: "G-WCJ4QHMDYF"
};

// --- LOGIC TRÁNH LỖI TREO APP ---
// Kiểm tra xem đã kết nối chưa, nếu chưa thì mới tạo mới.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// --------------------------------

// Khởi tạo Auth và Database
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };



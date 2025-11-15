// utils/deviceId.ts
export const getDeviceId = () => {
  if (typeof window === 'undefined') return 'unknown';
  
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    // ایجاد شناسه منحصر بفرد برای دستگاه
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + 
               '_' + Date.now().toString(36);
    localStorage.setItem('deviceId', deviceId);
    
    // ذخیره اطلاعات اولیه
    localStorage.setItem('customerName', 'مهمان');
  }
  
  return deviceId;
};
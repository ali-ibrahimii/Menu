"use client";

import React from "react";

// رسید 80mm برای پرینتر حرارتی - فقط inline style تا توی چاپ سفید نیاد
export function Receipt80mm({ order }: { order: any }) {
  return (
    <div
      id="print-receipt"
      style={{
        width: "300px",
        maxWidth: "80mm",
        background: "white",
        color: "black",
        fontFamily: "monospace, Tahoma",
        fontSize: "12px",
        lineHeight: "1.4",
        padding: "8px",
        direction: "rtl",
      }}
    >
      {/* هدر */}
      <div
        style={{
          textAlign: "center",
          borderBottom: "2px dashed black",
          paddingBottom: "8px",
          marginBottom: "8px",
        }}
      >
        <div style={{ fontWeight: "900", fontSize: "16px" }}>
          رستوران وطندار
        </div>
        <div style={{ fontSize: "10px" }}>VATANDAR RESTAURANT</div>
        <div style={{ fontSize: "10px", marginTop: "4px" }}>
          {new Date().toLocaleString("fa-IR")}
        </div>
        <div style={{ fontSize: "10px" }}>شماره: {order.id?.slice(0, 8)}</div>
      </div>

      {/* اطلاعات مشتری */}
      <div style={{ fontSize: "11px", marginBottom: "8px", lineHeight: "1.6" }}>
        <div>مشتری: {order.customer_name}</div>
        {order.customer_phone && <div>تماس: {order.customer_phone}</div>}
        <div>
          نوع:{" "}
          {order.order_type === "delivery"
            ? "بیرون‌بر 🛵"
            : `داخل - میز ${order.table_number || "-"}`}
        </div>
        {order.delivery_address && <div>آدرس: {order.delivery_address}</div>}
        <div>
          پرداخت: {order.payment_method === "online" ? "آنلاین" : "نقدی"} -{" "}
          {order.payment_status}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px dashed black",
          borderBottom: "1px dashed black",
          padding: "6px 0",
          margin: "8px 0",
        }}
      >
        {(order.items || []).map((item: any, i: number) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              padding: "2px 0",
            }}
          >
            <span style={{ flex: 1 }}>
              {item.name_fa} x{item.quantity}
            </span>
            <span style={{ fontWeight: "bold" }}>
              {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "11px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>جمع جزء</span>
          <span>{Number(order.total_price || 0).toLocaleString()}</span>
        </div>
        {Number(order.delivery_fee) > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>ارسال</span>
            <span>{Number(order.delivery_fee).toLocaleString()}</span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "900",
            fontSize: "13px",
            borderTop: "1px solid black",
            marginTop: "4px",
            paddingTop: "4px",
          }}
        >
          <span>قابل پرداخت</span>
          <span>
            {Number(
              order.final_price || order.total_price || 0,
            ).toLocaleString()}{" "}
            ؋
          </span>
        </div>
      </div>

      {order.notes && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "11px",
            borderTop: "1px dashed black",
            paddingTop: "6px",
          }}
        >
          <div style={{ fontWeight: "bold" }}>یادداشت:</div>
          <div>{order.notes}</div>
        </div>
      )}

      <div
        style={{
          textAlign: "center",
          marginTop: "12px",
          borderTop: "2px dashed black",
          paddingTop: "8px",
          fontSize: "10px",
        }}
      >
        <div>با تشکر از شما</div>
        <div style={{ marginTop: "4px" }}>***</div>
      </div>
    </div>
  );
}

// تابع چاپ مطمئن - مشکل صفحه سفید رو حل میکنه
export function printReceiptDirect(order: any) {
  const html = document.getElementById("print-receipt-hidden")?.innerHTML;
  if (!html) {
    alert("رسید پیدا نشد");
    return;
  }

  const win = window.open("", "_blank", "width=400,height=600");
  if (!win) {
    alert("پاپ‌آپ بلاک شده - لطفا پاپ‌آپ را فعال کنید");
    return;
  }

  win.document.write(`
    <html>
      <head>
        <title>Receipt ${order.id?.slice(0, 8)}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; padding: 0; background: white; display: flex; justify-content: center; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style>
      </head>
      <body onload="window.print(); window.onafterprint = () => window.close();">
        ${html}
      </body>
    </html>
  `);
  win.document.close();
}

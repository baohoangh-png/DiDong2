import React, { createContext, useContext, useState } from 'react';

// Định nghĩa kiểu dữ liệu cho món hàng trong giỏ
type CartItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    // Tính tổng tiền
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Hàm thêm vào giỏ
    const addToCart = (product: any) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                // Nếu có rồi thì tăng số lượng
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Chưa có thì thêm mới
            return [...prevItems, {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            }];
        });
        // Thông báo nhỏ (hoặc bạn có thể bỏ nếu thích im lặng)
        // Alert.alert("Thêm thành công", `Đã thêm ${product.name} vào giỏ!`);
    };

    // Hàm xóa khỏi giỏ
    const removeFromCart = (id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    // Hàm xóa sạch giỏ
    const clearCart = () => setItems([]);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook để dùng nhanh ở các trang khác
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart phải được dùng bên trong CartProvider");
    return context;
};
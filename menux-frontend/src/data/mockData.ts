// src/data/mockData.ts
import { Order } from "../types";

export const MOCK_ORDERS: Order[] = [
  {
    id: "12D0B-3A",
    customer_name: "Aldo Vesper",
    table_number: "2B",
    items_count: 6,
    total_amount: 1099,
    status: "COOKING",
    created_at: "11:10 PM",
  },
  {
    id: "12D0B-3B",
    customer_name: "Liam Blackwood",
    table_number: "2B",
    items_count: 12,
    total_amount: 2450,
    status: "PENDING",
    created_at: "11:30 PM",
  }
];

// // src/data/mockData.ts
// export const MOCK_PRODUCTS = [
//   {
//     id: "item_1",
//     name: "Fiery Jalapeno",
//     category: "Pizza",
//     price: 199,
//     image: "/api/placeholder/400/300", // Placeholder for trial
//     is_veg: true,
//     is_available: true,
//     variants: ["Original", "Barbecue chicken"]
//   },
//   {
//     id: "item_2",
//     name: "Chicken Dominator",
//     category: "Pizza",
//     price: 499,
//     image: "/api/placeholder/400/300",
//     is_veg: false,
//     is_available: true,
//     variants: ["Original", "Grilled chicken"]
//   },
//   {
//     id: "item_3",
//     name: "Nellore Chicken Biryani",
//     category: "Biryani",
//     price: 399,
//     image: "/api/placeholder/400/300",
//     is_veg: false,
//     is_available: false, // Example of an item that is "Out of Stock"
//     variants: ["Original", "Extra Meat"]
//   },
//   {
//     id: "item_4",
//     name: "Paneer Tikka",
//     category: "Starters",
//     price: 249,
//     image: "/api/placeholder/400/300",
//     is_veg: true,
//     is_available: true,
//     variants: []
//   }
// ];

// src/data/mockData.ts
export const CATEGORIES = [
  "Recommended", "Starters", "Chinese", "Main Course", 
  "Roti", "Rice", "Beverages", "Soup", "Fast Food"
];

export const MOCK_MENU_ITEMS = [
  {
    id: "1",
    name: "Manchow Soup",
    category: "Soup",
    price: 120,
    description: "Spicy Indo-Chinese soup with fried noodles",
    is_veg: true,
    is_available: true,
    image: "https://images.unsplash.com/photo-1547592166-23acbe3a624b?w=500&q=80",
    variants: [
      { name: "Half", price: 120 },
      { name: "Full", price: 200 }
    ]
},
  {
    id: "2",
    name: "Paneer Chilli Dry",
    category: "Chinese",
    price: 240,
    description: "Cottage cheese cubes tossed in spicy soy sauce",
    is_veg: true,
    is_available: true,
    image: "https://images.unsplash.com/photo-1567188040706-fb8d89593139?w=500&q=80",
    variants: [
      { name: "Half", price: 240 },
      { name: "Full", price: 450 }
    ]
},
  {
    id: "3",
    name: "Butter Naan",
    category: "Roti",
    price: 45,
    description: "Soft leavened bread cooked in tandoor with butter",
    is_veg: true,
    is_available: true,
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80",
  },
  {
    id: "4",
    name: "Chicken Biryani",
    category: "Rice",
    price: 350,
    description: "Aromatic basmati rice cooked with tender chicken pieces",
    is_veg: false,
    is_available: true,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
  },
   // ... add more items for testing
];
const API_BASE = 'http://localhost:8080/api/restaurants';

// ⚠️ PASTE YOUR SECRETS HERE ⚠️
const RESTAURANT_ID = 'a7f6849e-9dd3-4193-83e7-d5b71da5c14e'; 
const TOKEN = '"eyJhbGciOiJFUzI1NiIsImtpZCI6ImU3OGQ0ZjJiLTZkZDctNDIzOC1iOGE3LTU0MjI4YjJjNWRkZiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3VocXVoZnhpcmF6Z2trdmVvY2x6LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5ZTJlMjI0OC00NGUxLTRhZWQtOThkZC1kNzNmNWYzYzMwY2QiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxODI5ODIxLCJpYXQiOjE3NzE4MjYyMjEsImVtYWlsIjoiYW1pdEBiYWxhamljZW50cmFsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJBbWl0IEFncmF3YWwiLCJwaG9uZSI6Ijg4ODg4ODg4ODgifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3MTgyNjIyMX1dLCJzZXNzaW9uX2lkIjoiNGU3ODhmNjEtMGI2Yi00YjU1LTk5NjctNzhiYWVlNmU3NjUwIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.8A_veBUw9IVeNMmeSlZW2TaQN1mq6X_sIOdjxd9e-qI5wJpyQ78ulR-LNiWupUwf8-8SsjAXJPdUxv2XHGtqmg"'; 

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

const menuToUpload = [
  {
    name: "Breakfast",
    items: [
      { name: "Choice of Paratha", description: "Served with Pickle and Curd", price: 130, isVeg: true, variants: [{ name: "Aloo", priceDifference: 0 }, { name: "Gobhi", priceDifference: 0 }, { name: "Paneer", priceDifference: 20 }] },
      { name: "Poha", description: "Served with Ratlami Sev", price: 70, isVeg: true, variants: [] },
    ]
  },
  {
    name: "Indian Main Course",
    items: [
      { name: "Paneer Butter Masala", description: "Cooked in Tomato Gravy", price: 250, isVeg: true, variants: [] }
    ]
  }
];

async function seed() {
  console.log("🚀 Starting Upload...");

  for (const cat of menuToUpload) {
    console.log(`\nCategory: ${cat.name}`);
    
    // 1. Create Category
    // 1. Create Category with "Kitchen Sink" payload
    const catRes = await fetch(`${API_BASE}/${RESTAURANT_ID}/menu-categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        name: cat.name,
        description: cat.name,      // Some backends crash if description is null
        sortOrder: 0,               // Some backends crash if sortOrder is null
        isActive: true,
        restaurant: { id: RESTAURANT_ID }, // Some JPA mappings expect the whole object
        restaurantId: RESTAURANT_ID        // Others expect just the ID string
      })
    });

    if (!catRes.ok) {
      console.error(`❌ Category Error: ${catRes.status}`);
      console.log(await catRes.text());
      continue;
    }

    const savedCat = await catRes.json();

    for (const item of cat.items) {
      console.log(`  -> Item: ${item.name}`);
      
      // 2. Create Item
      const itemRes = await fetch(`${API_BASE}/${RESTAURANT_ID}/menu-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          categoryId: savedCat.id,
          name: item.name,
          description: item.description,
          price: item.price,
          isVeg: item.isVeg,
          isAvailable: true
        })
      });

      if (!itemRes.ok) {
        console.error(`  ❌ Item Error: ${itemRes.status}`);
        continue;
      }

      const savedItem = await itemRes.json();

      // 3. Create Variants
      for (const v of item.variants) {
        console.log(`    * Variant: ${v.name}`);
        await fetch(`${API_BASE}/${RESTAURANT_ID}/menu-items/${savedItem.id}/variants`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: v.name,
            priceDifference: v.priceDifference
          })
        });
      }
    }
  }
  console.log("\n✅ Done! Refresh your menu page.");
}

seed();
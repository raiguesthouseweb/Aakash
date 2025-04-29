/**
 * Rai Guest House - Google Apps Script Backend
 * 
 * This script serves as a web API for the Rai Guest House website,
 * allowing it to interact with Google Sheets for:
 * - Menu items management
 * - Order processing
 * - Tourism places information
 * 
 * Deploy this script as a web app with:
 * - Execute as: Me (your Google account)
 * - Who has access: Anyone (no login required)
 */

// Configuration - Update these with your actual spreadsheet IDs
const CONFIG = {
  MENU_SPREADSHEET_ID: "1dlrMCBndJsgFAQi3c9yf-7Rg_ZMIIFHlo2yCHYGyWGk",
  ORDERS_SPREADSHEET_ID: "1RzPVjVA635R8GgjKSsvTLW2tC-FpVB0JdwVpp7ffVys",
  TOURISM_SPREADSHEET_ID: "1zu4ySz1wQoelaFteEfnS8HvWUbuxQ8kMYS58GNNTYq8",
  MENU_SHEET_NAME: "Menu",
  ORDERS_SHEET_NAME: "Orders",
  TOURISM_SHEET_NAME: "Tourism"
};

/**
 * Handles HTTP GET and POST requests
 * This is the main entry point for the web app
 */
function doGet(e) {
  try {
    // Allow CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    const action = e.parameter.action;
    let data;
    
    switch (action) {
      case 'getMenu':
        data = getMenuItems();
        break;
      case 'getTourism':
        data = getTourismPlaces();
        break;
      case 'getOrders':
        const filterBy = e.parameter.filterBy;
        data = getOrders(filterBy);
        break;
      default:
        data = { error: 'Invalid action. Use one of: getMenu, getTourism, getOrders' };
    }
    
    output.setContent(JSON.stringify(data));
    return output;
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles HTTP POST requests
 */
function doPost(e) {
  try {
    // Allow CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    const action = e.parameter.action;
    const postData = JSON.parse(e.postData.contents);
    let data;
    
    switch (action) {
      case 'createOrder':
        data = createOrder(postData);
        break;
      case 'updateOrderStatus':
        data = updateOrderStatus(postData.orderId, postData.status);
        break;
      case 'createMenuItem':
        data = createMenuItem(postData);
        break;
      case 'updateMenuItem':
        data = updateMenuItem(postData.id, postData);
        break;
      case 'deleteMenuItem':
        data = deleteMenuItem(postData.id);
        break;
      case 'createTourismPlace':
        data = createTourismPlace(postData);
        break;
      case 'updateTourismPlace':
        data = updateTourismPlace(postData.id, postData);
        break;
      case 'deleteTourismPlace':
        data = deleteTourismPlace(postData.id);
        break;
      default:
        data = { error: 'Invalid action' };
    }
    
    output.setContent(JSON.stringify(data));
    return output;
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get menu items from the spreadsheet
 */
function getMenuItems() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.MENU_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.MENU_SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return { items: [] };
  }
  
  // Based on the screenshot, the columns are:
  // A: Dish Name, B: Rate, C: Category, D: Details (optional)
  // We'll map them to our expected field names
  const nameIdx = 0;  // Column A - Dish Name
  const priceIdx = 1; // Column B - Rate
  const categoryIdx = 2; // Column C - Category
  const detailsIdx = 3; // Column D - Details (if exists)
  
  const items = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Skip empty rows
    if (!row[nameIdx]) continue;
    
    // Convert price format (remove ₹ symbol if present)
    let price = row[priceIdx];
    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[₹,]/g, ''));
    }
    
    const menuItem = {
      id: i,
      name: row[nameIdx],
      price: price,
      category: row[categoryIdx]
    };
    
    // Add details if they exist
    if (detailsIdx < row.length && row[detailsIdx]) {
      menuItem.details = row[detailsIdx];
    }
    
    items.push(menuItem);
  }
  
  return { items: items };
}

/**
 * Create a new menu item
 */
function createMenuItem(item) {
  if (!item.name || !item.price || !item.category) {
    throw new Error("Menu item must have name, price, and category");
  }
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.MENU_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.MENU_SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  // Based on the screenshot, the columns are:
  // A: Dish Name, B: Rate, C: Category, D: Details (optional)
  const nameIdx = 0;  // Column A - Dish Name
  const priceIdx = 1; // Column B - Rate
  const categoryIdx = 2; // Column C - Category
  const detailsIdx = 3; // Column D - Details (if exists)
  
  // Format price with ₹ symbol to match the sheet format
  let priceStr = item.price.toString();
  if (!priceStr.startsWith("₹")) {
    priceStr = "₹" + priceStr;
  }
  
  // Create new row with appropriate number of columns
  const newRow = ["", "", "", ""];
  newRow[nameIdx] = item.name;
  newRow[priceIdx] = priceStr;
  newRow[categoryIdx] = item.category;
  
  // Add details if provided
  if (item.details && detailsIdx < newRow.length) {
    newRow[detailsIdx] = item.details;
  }
  
  // Add the row to the end of the sheet
  sheet.appendRow(newRow);
  
  // Calculate the new ID (row number)
  const newId = sheet.getLastRow() - 1;
  
  return {
    success: true,
    item: {
      id: newId,
      name: item.name,
      price: item.price,
      category: item.category,
      details: item.details || ""
    }
  };
}

/**
 * Update an existing menu item
 */
function updateMenuItem(id, item) {
  if (id < 1) {
    throw new Error("Invalid menu item ID");
  }
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.MENU_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.MENU_SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  if (id >= data.length) {
    throw new Error("Menu item not found");
  }
  
  // Based on the screenshot, the columns are:
  // A: Dish Name, B: Rate, C: Category, D: Details (optional)
  const nameIdx = 0;  // Column A - Dish Name
  const priceIdx = 1; // Column B - Rate
  const categoryIdx = 2; // Column C - Category
  const detailsIdx = 3; // Column D - Details (if exists)
  
  // Keep existing values if not provided
  const row = data[id];
  
  if (item.name !== undefined) {
    sheet.getRange(id + 1, nameIdx + 1).setValue(item.name);
  }
  
  if (item.price !== undefined) {
    // Format price with ₹ symbol to match the sheet format
    let priceStr = item.price.toString();
    if (!priceStr.startsWith("₹")) {
      priceStr = "₹" + priceStr;
    }
    sheet.getRange(id + 1, priceIdx + 1).setValue(priceStr);
  }
  
  if (item.category !== undefined) {
    sheet.getRange(id + 1, categoryIdx + 1).setValue(item.category);
  }
  
  if (item.details !== undefined && detailsIdx < sheet.getMaxColumns()) {
    sheet.getRange(id + 1, detailsIdx + 1).setValue(item.details);
  }
  
  // Get the current values for the response
  const updatedRow = sheet.getRange(id + 1, 1, 1, 4).getValues()[0];
  
  // Convert price format for response (remove ₹ symbol)
  let price = updatedRow[priceIdx];
  if (typeof price === 'string') {
    price = parseFloat(price.replace(/[₹,]/g, ''));
  }
  
  return {
    success: true,
    item: {
      id: id,
      name: updatedRow[nameIdx],
      price: price,
      category: updatedRow[categoryIdx],
      details: detailsIdx < updatedRow.length ? updatedRow[detailsIdx] || "" : ""
    }
  };
}

/**
 * Delete a menu item
 */
function deleteMenuItem(id) {
  if (id < 1) {
    throw new Error("Invalid menu item ID");
  }
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.MENU_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.MENU_SHEET_NAME) || spreadsheet.getSheets()[0];
  
  if (id >= sheet.getLastRow()) {
    throw new Error("Menu item not found");
  }
  
  // Delete the row
  sheet.deleteRow(id + 1);
  
  return { success: true };
}

/**
 * Get tourism places from the spreadsheet
 */
function getTourismPlaces() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.TOURISM_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.TOURISM_SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return { places: [] };
  }
  
  const headers = data[0];
  const titleIdx = headers.indexOf("title");
  const descriptionIdx = headers.indexOf("description");
  const distanceIdx = headers.indexOf("distance");
  const tagsIdx = headers.indexOf("tags");
  const mapsLinkIdx = headers.indexOf("mapsLink");
  
  if (titleIdx === -1 || descriptionIdx === -1) {
    throw new Error("Tourism sheet must have columns: title, description");
  }
  
  const places = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Skip empty rows
    if (!row[titleIdx]) continue;
    
    places.push({
      id: i,
      title: row[titleIdx],
      description: row[descriptionIdx],
      distance: distanceIdx !== -1 ? row[distanceIdx] : "Unknown",
      tags: tagsIdx !== -1 && row[tagsIdx] ? row[tagsIdx].split(",").map(tag => tag.trim()) : [],
      mapsLink: mapsLinkIdx !== -1 ? row[mapsLinkIdx] : ""
    });
  }
  
  return { places: places };
}

/**
 * Create a new tourism place
 */
function createTourismPlace(place) {
  if (!place.title || !place.description) {
    throw new Error("Tourism place must have title and description");
  }
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.TOURISM_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.TOURISM_SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const titleIdx = headers.indexOf("title");
  const descriptionIdx = headers.indexOf("description");
  const distanceIdx = headers.indexOf("distance");
  const tagsIdx = headers.indexOf("tags");
  const mapsLinkIdx = headers.indexOf("mapsLink");
  
  if (titleIdx === -1 || descriptionIdx === -1) {
    throw new Error("Tourism sheet must have columns: title, description");
  }
  
  const newRow = Array(headers.length).fill("");
  newRow[titleIdx] = place.title;
  newRow[descriptionIdx] = place.description;
  if (distanceIdx !== -1) newRow[distanceIdx] = place.distance || "Unknown";
  if (tagsIdx !== -1) newRow[tagsIdx] = Array.isArray(place.tags) ? place.tags.join(", ") : "";
  if (mapsLinkIdx !== -1) newRow[mapsLinkIdx] = place.mapsLink || "";
  
  sheet.appendRow(newRow);
  
  return {
    success: true,
    place: {
      id: data.length,
      title: place.title,
      description: place.description,
      distance: place.distance || "Unknown",
      tags: Array.isArray(place.tags) ? place.tags : [],
      mapsLink: place.mapsLink || ""
    }
  };
}

/**
 * Update an existing tourism place
 */
function updateTourismPlace(id, place) {
  if (id < 1) {
    throw new Error("Invalid tourism place ID");
  }
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.TOURISM_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.TOURISM_SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  if (id >= data.length) {
    throw new Error("Tourism place not found");
  }
  
  const headers = data[0];
  const titleIdx = headers.indexOf("title");
  const descriptionIdx = headers.indexOf("description");
  const distanceIdx = headers.indexOf("distance");
  const tagsIdx = headers.indexOf("tags");
  const mapsLinkIdx = headers.indexOf("mapsLink");
  
  if (titleIdx === -1 || descriptionIdx === -1) {
    throw new Error("Tourism sheet must have columns: title, description");
  }
  
  // Keep existing values if not provided
  const row = data[id];
  if (place.title !== undefined) sheet.getRange(id + 1, titleIdx + 1).setValue(place.title);
  if (place.description !== undefined) sheet.getRange(id + 1, descriptionIdx + 1).setValue(place.description);
  if (distanceIdx !== -1 && place.distance !== undefined) sheet.getRange(id + 1, distanceIdx + 1).setValue(place.distance);
  if (tagsIdx !== -1 && place.tags !== undefined) sheet.getRange(id + 1, tagsIdx + 1).setValue(Array.isArray(place.tags) ? place.tags.join(", ") : "");
  if (mapsLinkIdx !== -1 && place.mapsLink !== undefined) sheet.getRange(id + 1, mapsLinkIdx + 1).setValue(place.mapsLink || "");
  
  return {
    success: true,
    place: {
      id: id,
      title: place.title !== undefined ? place.title : row[titleIdx],
      description: place.description !== undefined ? place.description : row[descriptionIdx],
      distance: place.distance !== undefined ? place.distance : (distanceIdx !== -1 ? row[distanceIdx] : "Unknown"),
      tags: place.tags !== undefined ? place.tags : (tagsIdx !== -1 && row[tagsIdx] ? row[tagsIdx].split(",").map(tag => tag.trim()) : []),
      mapsLink: place.mapsLink !== undefined ? place.mapsLink : (mapsLinkIdx !== -1 ? row[mapsLinkIdx] : "")
    }
  };
}

/**
 * Delete a tourism place
 */
function deleteTourismPlace(id) {
  if (id < 1) {
    throw new Error("Invalid tourism place ID");
  }
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.TOURISM_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.TOURISM_SHEET_NAME) || spreadsheet.getSheets()[0];
  
  if (id >= sheet.getLastRow()) {
    throw new Error("Tourism place not found");
  }
  
  // Delete the row
  sheet.deleteRow(id + 1);
  
  return { success: true };
}

/**
 * Get orders from the spreadsheet, optionally filtered by room or mobile number
 */
function getOrders(filterBy) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.ORDERS_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.ORDERS_SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return { orders: [] };
  }
  
  const headers = data[0];
  const idIdx = headers.indexOf("id");
  const timestampIdx = headers.indexOf("timestamp");
  const statusIdx = headers.indexOf("status");
  const nameIdx = headers.indexOf("name");
  const roomNumberIdx = headers.indexOf("roomNumber");
  const mobileNumberIdx = headers.indexOf("mobileNumber");
  const itemsIdx = headers.indexOf("items");
  const totalIdx = headers.indexOf("total");
  
  if (roomNumberIdx === -1 || mobileNumberIdx === -1) {
    throw new Error("Orders sheet must have columns: roomNumber, mobileNumber");
  }
  
  const orders = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Skip empty rows
    if (!row[roomNumberIdx] && !row[mobileNumberIdx]) continue;
    
    // Apply filter if provided
    if (filterBy && row[roomNumberIdx] !== filterBy && row[mobileNumberIdx] !== filterBy) {
      continue;
    }
    
    // Parse items JSON safely
    let items = [];
    if (itemsIdx !== -1 && row[itemsIdx]) {
      try {
        items = JSON.parse(row[itemsIdx]);
      } catch (e) {
        // If parsing fails, keep empty array
      }
    }
    
    orders.push({
      id: idIdx !== -1 ? row[idIdx] : i,
      timestamp: timestampIdx !== -1 ? row[timestampIdx] : new Date().toISOString(),
      status: statusIdx !== -1 ? row[statusIdx] : "Pending",
      name: nameIdx !== -1 ? row[nameIdx] : "",
      roomNumber: row[roomNumberIdx] || "",
      mobileNumber: row[mobileNumberIdx] || "",
      items: items,
      total: totalIdx !== -1 ? row[totalIdx] : 0
    });
  }
  
  return { orders: orders };
}

/**
 * Create a new order
 */
function createOrder(order) {
  if (!order.roomNumber || !order.items || !Array.isArray(order.items)) {
    throw new Error("Order must have roomNumber and items array");
  }
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.ORDERS_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.ORDERS_SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const idIdx = headers.indexOf("id");
  const timestampIdx = headers.indexOf("timestamp");
  const statusIdx = headers.indexOf("status");
  const nameIdx = headers.indexOf("name");
  const roomNumberIdx = headers.indexOf("roomNumber");
  const mobileNumberIdx = headers.indexOf("mobileNumber");
  const itemsIdx = headers.indexOf("items");
  const totalIdx = headers.indexOf("total");
  
  if (roomNumberIdx === -1 || mobileNumberIdx === -1) {
    throw new Error("Orders sheet must have columns: roomNumber, mobileNumber");
  }
  
  // Generate a new order ID
  const orderId = Date.now();
  const timestamp = new Date().toISOString();
  
  const newRow = Array(headers.length).fill("");
  if (idIdx !== -1) newRow[idIdx] = orderId;
  if (timestampIdx !== -1) newRow[timestampIdx] = timestamp;
  if (statusIdx !== -1) newRow[statusIdx] = "Pending";
  if (nameIdx !== -1) newRow[nameIdx] = order.name || "";
  newRow[roomNumberIdx] = order.roomNumber;
  newRow[mobileNumberIdx] = order.mobileNumber || "";
  if (itemsIdx !== -1) newRow[itemsIdx] = JSON.stringify(order.items);
  if (totalIdx !== -1) newRow[totalIdx] = order.total || 0;
  
  sheet.appendRow(newRow);
  
  return {
    success: true,
    order: {
      id: orderId,
      timestamp: timestamp,
      status: "Pending",
      name: order.name || "",
      roomNumber: order.roomNumber,
      mobileNumber: order.mobileNumber || "",
      items: order.items,
      total: order.total || 0
    }
  };
}

/**
 * Update an order's status
 */
function updateOrderStatus(orderId, status) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }
  
  if (!status || !["Pending", "Preparing", "Delivered"].includes(status)) {
    throw new Error("Status must be one of: Pending, Preparing, Delivered");
  }
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.ORDERS_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.ORDERS_SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  const headers = data[0];
  const idIdx = headers.indexOf("id");
  const statusIdx = headers.indexOf("status");
  
  if (idIdx === -1) {
    throw new Error("Orders sheet must have an 'id' column");
  }
  
  if (statusIdx === -1) {
    throw new Error("Orders sheet must have a 'status' column");
  }
  
  // Find the order row
  let orderRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] == orderId) {
      orderRow = i;
      break;
    }
  }
  
  if (orderRow === -1) {
    throw new Error("Order not found");
  }
  
  // Update the status
  sheet.getRange(orderRow + 1, statusIdx + 1).setValue(status);
  
  return { 
    success: true,
    order: {
      id: orderId,
      status: status
    }
  };
}

/**
 * Test function that can be run from the script editor
 */
function test() {
  Logger.log("Testing getMenuItems()");
  Logger.log(JSON.stringify(getMenuItems()));
  
  Logger.log("Testing getTourismPlaces()");
  Logger.log(JSON.stringify(getTourismPlaces()));
  
  Logger.log("Testing getOrders()");
  Logger.log(JSON.stringify(getOrders()));
}
import { prisma } from '../lib/prisma.js';
import { getTaxSettingsHelper } from '../controllers/settings.controller.js';

export const mapDbStatusToUi = (dbStatus) => {
  switch (dbStatus) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'SHIPPING':
      return 'Shipping';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELED':
      return 'Cancelled';
    default:
      return dbStatus || 'In Progress';
  }
};

export const mapUiStatusToDb = (uiStatus) => {
  switch ((uiStatus || '').toLowerCase()) {
    case 'in progress':
      return 'IN_PROGRESS';
    case 'shipping':
      return 'SHIPPING';
    case 'delivered':
    case 'completed':
      return 'DELIVERED';
    case 'cancelled':
    case 'canceled':
      return 'CANCELED';
    default:
      return 'IN_PROGRESS';
  }
};

export const formatOrderForUi = (order) => {
  const firstItem = order.items?.[0] || {};
  const product = firstItem.product || {};
  const user = order.user || {};
  const manufacturer = order.manufacturer || null;

  // Parse shippingAddress if it is a JSON string
  let formattedAddress = order.shippingAddress || 'Customer Address';
  let recipientName = user.fullName || user.email || '';
  let recipientPhone = user.mobile || '';
  let recipientCountry = user.country || '';

  if (typeof order.shippingAddress === 'string') {
    const trimmed = order.shippingAddress.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          if (parsed.name && parsed.name !== 'User') {
            recipientName = parsed.name;
          }
          if (parsed.phone) {
            recipientPhone = parsed.phone;
          }
          if (parsed.country) {
            recipientCountry = parsed.country;
          }
          const parts = [
            parsed.street,
            parsed.city,
            parsed.state,
            parsed.zipCode,
            parsed.country
          ].filter(Boolean);
          if (parts.length > 0) {
            formattedAddress = parts.join(', ');
          }
        }
      } catch (e) {
        // Fallback to raw string
      }
    }
  }

  // Resolve best front and back image
  let frontImg = product.images?.[0] || product.coverPhoto;
  let backImg = product.images?.[1] || product.images?.[0] || product.coverPhoto;

  if (Array.isArray(product.colors) && firstItem.color) {
    const matchedColor = product.colors.find(c =>
      typeof c === 'object' && c?.name?.toLowerCase() === firstItem.color?.toLowerCase()
    );
    if (matchedColor?.images?.[0]) {
      frontImg = matchedColor.images[0];
      backImg = matchedColor.images[1] || matchedColor.images[0];
    } else if (matchedColor?.image) {
      frontImg = matchedColor.image;
    }
  }

  if (!frontImg) {
    frontImg = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
  }
  if (!backImg) {
    backImg = 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80';
  }

  // Resolve accurate manufacturer payment from DB or calculate from product catalog manufacturePrice
  let resolvedMfgPayment = (typeof order.mfgPayment === 'number' && order.mfgPayment > 0)
    ? order.mfgPayment
    : 0;

  if (resolvedMfgPayment === 0 && Array.isArray(order.items) && order.items.length > 0) {
    let computedMfg = 0;
    for (const it of order.items) {
      const unitMfg = (typeof it.product?.manufacturePrice === 'number' && it.product.manufacturePrice > 0)
        ? it.product.manufacturePrice
        : Math.round((it.price || it.product?.price || 0) * 0.6);
      computedMfg += unitMfg * (it.quantity || 1);
    }
    resolvedMfgPayment = computedMfg;
  }

  if (resolvedMfgPayment === 0) {
    resolvedMfgPayment = Math.round((order.totalPrice || 100) * 0.6);
  }

  return {
    id: order.id,
    orderedDate: order.createdAt
      ? new Date(order.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    itemName: firstItem.name || 'Athletic Product',
    mfgItemName: product.manufactureName || firstItem.name || 'MFG Athletic Product',
    size: firstItem.size || 'L',
    color: firstItem.color || 'Standard',
    orderedBy: user.id || order.userId || '',
    fullName: recipientName || user.fullName || user.email || 'Customer',
    phone: recipientPhone || user.mobile || 'N/A',
    country: recipientCountry || user.country || 'India',
    shippingAddress: formattedAddress,
    amountPaid: order.totalPrice || 0,
    mfgPayment: resolvedMfgPayment,
    manufacturerId: order.manufacturerId || null,
    manufacturerName: manufacturer ? (manufacturer.companyName || manufacturer.fullName) : null,
    shipperName: order.shipperName || 'None',
    trackingId: order.trackingNumber || 'None',
    trackingLink: order.trackingLink || 'None',
    status: order.cancelRequested ? 'Cancel Requested' : mapDbStatusToUi(order.status),
    previousStatus: mapDbStatusToUi(order.status),
    cancelReason: order.cancelReason || '',
    cancelRequested: order.cancelRequested || false,
    priceAdjustmentStatus: order.priceAdjustmentStatus || 'None',
    priceAdjustmentAmount: order.priceAdjustmentAmount || 0,
    priceAdjustmentReason: order.priceAdjustmentReason || '',
    mfgPaymentStatus: order.mfgPaymentStatus || 'Unpaid',
    mfgPaidDate: order.mfgPaidDate || null,
    completedDate: order.completedDate || null,
    productDetails: {
      mfgProductName: product.manufactureName || product.name || firstItem.name || 'MFG Athletic Item',
      frontViewUrl: frontImg,
      backViewUrl: backImg,
      neckLogoUrl: product.images?.[2] || '',
      printingDetails: product.manufactureSpec || {
        method: 'Direct-to-Film (DTF) Heat Transfer',
        frontPrintSpec: 'High-density chest print (10.5 in x 3.5 in)',
        backPrintSpec: 'Full graphic artwork back print (14 in x 18 in)',
        neckLogoSpec: 'Inner collar neck label 2.5 in x 1.0 in',
        fabricGSM: '240 GSM 100% Ring-Spun Cotton',
        pantoneCodes: '#1A1A1A / Washed Charcoal'
      }
    }
  };
};

/**
 * Creates a direct order submitted by Admin or Staff.
 * Automatically links or creates an underlying Product and OrderItem.
 */
export const createDirectOrder = async (orderData, creatorUserId) => {
  const {
    itemName,
    mfgItemName,
    size = 'L',
    color = 'Black',
    orderedBy,
    fullName,
    phone,
    country = 'United States',
    shippingAddress,
    amountPaid = 100,
    mfgPayment = 60,
    status = 'In Progress',
    manufacturerId = null
  } = orderData;

  const validAmountPaid = Number(amountPaid) || 0;
  const trimmedItemName = (itemName || 'Custom Product').trim();
  const trimmedMfgItemName = (mfgItemName || `MFG ${trimmedItemName}`).trim();

  // 1. Resolve or create associated Product
  let product = await prisma.product.findFirst({
    where: {
      name: { equals: trimmedItemName, mode: 'insensitive' }
    }
  });

  const parsedMfgPayment = Number(mfgPayment);
  let validMfgPayment = (parsedMfgPayment > 0) ? parsedMfgPayment : 0;
  if (!validMfgPayment && product && typeof product.manufacturePrice === 'number' && product.manufacturePrice > 0) {
    validMfgPayment = product.manufacturePrice;
  }
  if (!validMfgPayment) {
    validMfgPayment = Math.round(validAmountPaid * 0.6);
  }

  if (!product) {
    product = await prisma.product.create({
      data: {
        name: trimmedItemName,
        manufactureName: trimmedMfgItemName,
        price: validAmountPaid,
        manufacturePrice: validMfgPayment,
        category: 'Apparel',
        gender: 'Unisex',
        stock: 100,
        inStock: true,
        manufacturerId: manufacturerId || null
      }
    });
  }

  // 2. Resolve Customer User ID
  let targetUserId = null;
  if (orderedBy && orderedBy.trim()) {
    const trimmedOrderedBy = orderedBy.trim();
    const existingUserById = await prisma.user.findUnique({
      where: { id: trimmedOrderedBy }
    });
    if (existingUserById) {
      targetUserId = existingUserById.id;
    } else {
      const existingUserByName = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: trimmedOrderedBy, mode: 'insensitive' } },
            { fullName: { equals: trimmedOrderedBy, mode: 'insensitive' } }
          ]
        }
      });
      if (existingUserByName) {
        targetUserId = existingUserByName.id;
      }
    }
  }

  // If still not matched, check if customer fullName or phone matches
  if (!targetUserId && fullName && fullName.trim()) {
    const trimmedName = fullName.trim();
    const matchedUser = await prisma.user.findFirst({
      where: {
        OR: [
          { fullName: { equals: trimmedName, mode: 'insensitive' } },
          { email: { equals: trimmedName, mode: 'insensitive' } }
        ]
      }
    });
    if (matchedUser) {
      targetUserId = matchedUser.id;
    }
  }

  if (!targetUserId && phone && phone.trim()) {
    const matchedByPhone = await prisma.user.findFirst({
      where: {
        mobile: { contains: phone.trim() }
      }
    });
    if (matchedByPhone) {
      targetUserId = matchedByPhone.id;
    }
  }

  // If still not resolved, assign to a customer with role 'USER' rather than Admin
  if (!targetUserId) {
    const customerUser = await prisma.user.findFirst({
      where: { role: 'USER' }
    });
    if (customerUser) {
      targetUserId = customerUser.id;
    } else {
      targetUserId = creatorUserId;
    }
  }

  // 3. Resolve Manufacturer ID if provided
  let validManufacturerId = null;
  if (manufacturerId && manufacturerId.trim() && manufacturerId !== 'all' && manufacturerId !== 'unassigned') {
    const mfgUser = await prisma.user.findFirst({
      where: {
        id: manufacturerId.trim(),
        role: 'MANUFACTURER'
      }
    });
    if (mfgUser) {
      validManufacturerId = mfgUser.id;
    }
  }

  // 4. Create Order and OrderItem
  const dbStatus = mapUiStatusToDb(status);
  const formattedShippingAddress = typeof shippingAddress === 'string'
    ? shippingAddress
    : JSON.stringify(shippingAddress || {});

  const order = await prisma.order.create({
    data: {
      userId: targetUserId,
      manufacturerId: validManufacturerId,
      shippingAddress: formattedShippingAddress,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: validAmountPaid,
      mfgPayment: validMfgPayment,
      status: dbStatus,
      paymentStatus: 'SUCCESSFUL',
      mfgPaymentStatus: 'Unpaid',
      items: {
        create: [
          {
            productId: product.id,
            name: trimmedItemName,
            size: size || 'L',
            color: color || 'Black',
            quantity: 1,
            price: validAmountPaid
          }
        ]
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          country: true
        }
      },
      manufacturer: {
        select: {
          id: true,
          fullName: true,
          companyName: true,
          email: true
        }
      }
    }
  });

  return formatOrderForUi(order);
};

/**
 * Creates an order from consumer checkout (shopping cart).
 */
export const createCheckoutOrder = async (orderItems, shippingAddress, paymentMethod, userId) => {
  let itemsPrice = 0;
  let totalMfgPayment = 0;
  const itemsToCreate = [];

  for (const item of orderItems) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      throw new Error(`Product ${item.name || item.productId} not found`);
    }

    const itemTotal = product.price * item.quantity;
    itemsPrice += itemTotal;

    // Calculate manufacturer price for this item using catalog manufacturePrice
    const unitMfgPrice = (typeof product.manufacturePrice === 'number' && product.manufacturePrice > 0)
      ? product.manufacturePrice
      : Math.round(product.price * 0.6);
    totalMfgPayment += unitMfgPrice * item.quantity;

    itemsToCreate.push({
      productId: product.id,
      name: product.name,
      size: item.size || 'M',
      color: item.color || null,
      quantity: item.quantity,
      price: product.price
    });
  }

  const taxSettings = await getTaxSettingsHelper();
  let taxPrice = 0;
  if (taxSettings.enableGst) {
    // We assume checkout orders are currently all domestic/India since shipping logic is simple
    // A more advanced integration would check if shippingAddress.country === 'India'
    const isIndianBuyer = true; 
    
    if (isIndianBuyer) {
      taxPrice = itemsPrice > taxSettings.indianThreshold 
        ? itemsPrice * (taxSettings.indianHighRate / 100) 
        : itemsPrice * (taxSettings.indianLowRate / 100);
    } else {
      taxPrice = itemsPrice * (taxSettings.nonIndianRate / 100);
    }
  }

  const shippingPrice = itemsPrice > 150 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;
  const mfgPayment = totalMfgPayment;
  const paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'SUCCESSFUL';

  const order = await prisma.order.create({
    data: {
      userId,
      shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
      taxPrice,
      shippingPrice,
      totalPrice,
      mfgPayment,
      paymentStatus,
      status: 'IN_PROGRESS',
      items: {
        create: itemsToCreate
      }
    },
    include: {
      items: {
        include: { product: true }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          country: true
        }
      },
      manufacturer: {
        select: {
          id: true,
          fullName: true,
          companyName: true,
          email: true
        }
      }
    }
  });

  return formatOrderForUi(order);
};

/**
 * Retrieves orders filtered by role (ADMIN sees all; MANUFACTURER sees assigned + unassigned).
 */
export const getOrdersForUser = async (user) => {
  const userRole = (user?.role || '').toUpperCase();
  const whereClause = {};

  if (userRole === 'MANUFACTURER' && user?.id) {
    whereClause.OR = [
      { manufacturerId: user.id },
      { manufacturerId: null }
    ];
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          country: true
        }
      },
      manufacturer: {
        select: {
          id: true,
          fullName: true,
          companyName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return orders.map(formatOrderForUi);
};

/**
 * Updates order to shipping status with tracking information.
 */
export const updateShipping = async (id, shippingData) => {
  const { shipperName, trackingId, trackingLink, status } = shippingData;

  const currentOrder = await prisma.order.findUnique({
    where: { id },
    select: { status: true }
  });

  if (!currentOrder) {
    throw new Error('Order not found');
  }

  let targetStatus = currentOrder.status;
  if (status) {
    targetStatus = mapUiStatusToDb(status);
  } else if (currentOrder.status === 'IN_PROGRESS') {
    targetStatus = 'SHIPPING';
  }

  const cleanShipper = shipperName && shipperName !== 'None' ? shipperName.trim() : null;
  const cleanTrackingId = trackingId && trackingId !== 'None' ? trackingId.trim() : null;
  const cleanTrackingLink = trackingLink && trackingLink !== 'None' ? trackingLink.trim() : null;

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: targetStatus,
      shipperName: cleanShipper,
      trackingNumber: cleanTrackingId,
      trackingLink: cleanTrackingLink
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Marks order as delivered/completed.
 */
export const completeOrder = async (id, completedDate) => {
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: 'DELIVERED',
      completedDate: completedDate || new Date().toISOString().split('T')[0]
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Cancels order directly with reason.
 */
export const cancelOrder = async (id, cancelReason) => {
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: 'CANCELED',
      cancelReason: cancelReason || 'Cancelled by Admin',
      cancelRequested: false
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Submits a price adjustment request from Manufacturer.
 */
export const requestPriceAdjustment = async (id, priceAdjustmentAmount, priceAdjustmentReason) => {
  const updated = await prisma.order.update({
    where: { id },
    data: {
      priceAdjustmentAmount: parseFloat(priceAdjustmentAmount) || 0,
      priceAdjustmentReason: priceAdjustmentReason || '',
      priceAdjustmentStatus: 'Pending Approval'
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Responds to a price adjustment request (approve or reject).
 */
export const handlePriceAdjustmentResponse = async (id, action) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new Error('Order not found');
  }

  const isApproved = action === 'approve';
  const adjustment = order.priceAdjustmentAmount || 0;
  const newMfgPayment = isApproved
    ? Number((order.mfgPayment + adjustment).toFixed(2))
    : order.mfgPayment;

  const updated = await prisma.order.update({
    where: { id },
    data: {
      priceAdjustmentStatus: isApproved ? 'Approved' : 'Rejected',
      mfgPayment: newMfgPayment
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Submits an order cancellation request from Manufacturer.
 */
export const requestOrderCancellation = async (id, cancelReason) => {
  const updated = await prisma.order.update({
    where: { id },
    data: {
      cancelRequested: true,
      cancelReason: cancelReason || 'Manufacturer requested cancellation'
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Responds to a cancellation request (accept or reject).
 */
export const handleCancellationResponse = async (id, action) => {
  const isAccepted = action === 'accept';

  const updated = await prisma.order.update({
    where: { id },
    data: {
      cancelRequested: false,
      status: isAccepted ? 'CANCELED' : undefined,
      cancelReason: isAccepted ? 'Cancellation request accepted' : null
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Updates manufacturer payout status (Paid / Unpaid).
 */
export const updateMfgPaymentStatus = async (id, mfgPaymentStatus, mfgPaidDate) => {
  const updated = await prisma.order.update({
    where: { id },
    data: {
      mfgPaymentStatus: mfgPaymentStatus || 'Paid',
      mfgPaidDate: mfgPaymentStatus === 'Paid'
        ? (mfgPaidDate || new Date().toISOString().split('T')[0])
        : null
    },
    include: {
      items: { include: { product: true } },
      user: true,
      manufacturer: true
    }
  });

  return formatOrderForUi(updated);
};

/**
 * Retrieves a single order by ID.
 */
export const getOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          country: true
        }
      },
      manufacturer: {
        select: {
          id: true,
          fullName: true,
          companyName: true,
          email: true
        }
      }
    }
  });

  if (!order) return null;
  return formatOrderForUi(order);
};

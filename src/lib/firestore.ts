import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  limit
} from 'firebase/firestore';

export interface ShipmentData {
  id?: string;
  userId: string;
  source: string;
  destination: string;
  shipmentType: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  riskLevel: string;
  riskScore: number;
  riskFactors: string[];
  recommendation: string;
  estimatedDelay: string;
  optimizationData?: any;
  distance?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Alert {
  id?: string;
  userId: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'weather' | 'route' | 'risk' | 'system';
  isRead: boolean;
  shipmentId?: string;
  source?: string;
  destination?: string;
  createdAt: any;
}

export const saveShipment = async (
  userId: string, 
  shipmentData: Omit<ShipmentData, 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    console.log('Saving shipment for user:', userId);
    console.log('Shipment data:', shipmentData);
    
    const docRef = await addDoc(collection(db, 'shipments'), {
      userId,
      ...shipmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Shipment saved with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving shipment:', error.message);
    throw error;
  }
};

export const getUserShipments = async (userId: string) => {
  try {
    console.log('Fetching shipments for user:', userId);
    
    const q = query(
      collection(db, 'shipments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    const shipments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Fetched shipments:', shipments.length);
    return shipments;
  } catch (error: any) {
    console.error('Error fetching shipments:', error.message);
    
    if (error.message.includes('index')) {
      console.log('Index not ready, trying simple query...');
      const simpleQ = query(
        collection(db, 'shipments'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(simpleQ);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    
    return [];
  }
};

export const getShipment = async (shipmentId: string) => {
  try {
    const docRef = doc(db, 'shipments', shipmentId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error: any) {
    console.error('Error getting shipment:', error.message);
    return null;
  }
};

export const getShipmentById = getShipment;

export const updateShipmentStatus = async (
  shipmentId: string, 
  status: string
) => {
  try {
    await updateDoc(doc(db, 'shipments', shipmentId), {
      status,
      updatedAt: serverTimestamp()
    });
    console.log('Shipment status updated:', shipmentId, status);
  } catch (error: any) {
    console.error('Error updating shipment:', error.message);
    throw error;
  }
};

export const deleteShipment = async (shipmentId: string) => {
  try {
    await deleteDoc(doc(db, 'shipments', shipmentId));
    console.log('Shipment deleted:', shipmentId);
  } catch (error: any) {
    console.error('Error deleting shipment:', error.message);
    throw error;
  }
};

// --- ALERT FUNCTIONS ---

export const saveAlert = async (alertData: Omit<Alert, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'alerts'), {
      ...alertData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving alert:', error.message);
    throw error;
  }
};

export const getUserAlerts = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Alert[];
  } catch (error: any) {
    console.error('Alerts fetch error:', error.message);
    // Graceful fallback if index is missing
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Alert[];
  }
};

export const markAlertRead = async (alertId: string) => {
  try {
    await updateDoc(doc(db, 'alerts', alertId), {
      isRead: true
    });
  } catch (error: any) {
    console.error('Error marking alert read:', error.message);
  }
};

export const markAllAlertsRead = async (userId: string) => {
  try {
    const alerts = await getUserAlerts(userId);
    const unread = alerts.filter(a => !a.isRead);
    await Promise.all(
      unread.map(a => markAlertRead(a.id!))
    );
  } catch (error: any) {
    console.error('Error marking all alerts read:', error.message);
  }
};

export const deleteAlert = async (alertId: string) => {
  try {
    await deleteDoc(doc(db, 'alerts', alertId));
  } catch (error: any) {
    console.error('Error deleting alert:', error.message);
  }
};

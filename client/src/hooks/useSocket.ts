import { useEffect } from 'react';
import { initSocket, getSocket, disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Initialize socket connection
    const socket = initSocket(user._id);

    // Listen for new listings nearby
    socket.on('new-listing', (data: any) => {
      toast.success(`New food available: ${data.listing.title}`, {
        duration: 5000,
        icon: '🍕',
      });
    });

    // Listen for new claims (donor receives)
    socket.on('new-claim', (data: any) => {
      toast.success(`${data.claimer.name} claimed your food!`, {
        duration: 5000,
        icon: '📦',
      });
    });

    // Listen for claim confirmations (receiver receives)
    socket.on('claim-confirmed', (data: any) => {
      toast.success('Your claim has been confirmed!', {
        duration: 5000,
        icon: '✅',
      });
    });

    // Listen for completed claims
    socket.on('claim-completed', (data: any) => {
      toast.success('Pickup verified! Thank you for reducing waste!', {
        duration: 5000,
        icon: '🎉',
      });
    });

    // Listen for cancelled claims
    socket.on('claim-cancelled', (data: any) => {
      toast('A claim has been cancelled', {
        duration: 5000,
        icon: '❌',
      });
    });

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [user, isAuthenticated]);

  return getSocket();
};


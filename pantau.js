 // Memantau pesan baru di chats user
      const userChatsRef = db.ref(`users/${userID}/chats`);
      userChatsRef.on('value', snapshot => {
        const chats = snapshot.val() || {};
        let unreadCount = 0;
        for (const key in chats) {
          if (chats[key].read === false || chats[key].read === undefined) {
            if (chats[key].ID !== userID) {
              unreadCount++;
            }
          }
        }
        if (unreadCount > 0) {
          notifInbox.style.display = 'inline-block';
          notifInbox.textContent = unreadCount > 99 ? '99+' : unreadCount;
        } else {
          notifInbox.style.display = 'none';
          notifInbox.textContent = '';
        }
      });

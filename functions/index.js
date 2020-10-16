const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendNotification = functions.firestore
  .document("messages/{groupId1}/{groupId2}/{message}")
  .onCreate((snap, context) => {
    console.log("----------------start function--------------------");

    const doc = snap.data();
    console.log(doc);

    const idFrom = doc.idFrom;
    const idTo = doc.idTo;
    const contentMessage = doc.content;

    // Get push token user to (receive)
    admin
      .firestore()
      .collection("users")
      .where("id", "==", idTo)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((userTo) => {
          console.log(
            `Found user to: ${userTo.data().nickname} ${
              userTo.data().pushToken
            }`
          );
          // Get info user from (sent)
          admin
            .firestore()
            .collection("users")
            .where("id", "==", idFrom)
            .get()
            .then((querySnapshot2) => {
              querySnapshot2.forEach((userFrom) => {
                console.log(`Found user from: ${userFrom.data().nickname}`);
                const payload = {
                  notification: {
                    title: `You have a message from "${
                      userFrom.data().nickname
                    }"`,
                    body: contentMessage,
                    badge: "1",
                    sound: "default",
                  },
                  data: {
                    title: `You have a message from "${
                      userFrom.data().nickname
                    }"`,
                    body: contentMessage,
                    peerId: userFrom.data().id,
                    peerAvatar: userFrom.data().photoUrl,
                    click_action: "FLUTTER_NOTIFICATION_CLICK",
                  },
                };
                // Let push to the target device
                admin
                  .messaging()
                  .sendToDevice(userTo.data().pushToken, payload)
                  .then((response) => {
                    console.log("Successfully sent message:", response);
                    return null;
                  })
                  .catch((error) => {
                    console.log("Error sending message:", error);
                  });
              });
              return null;
            })
            .catch((err) => console.log(err));
        });

        return null;
      })
      .catch((err) => console.log(err));
    return null;
  });

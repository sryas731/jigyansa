import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  module ChatMessage {
    public func compare(msg1 : ChatMessage, msg2 : ChatMessage) : Order.Order {
      if (msg1.timestamp < msg2.timestamp) { #less } else if (msg1.timestamp > msg2.timestamp) {
        #greater;
      } else {
        switch (msg1.messageType, msg2.messageType) {
          case (#user, #jigyansa) { #less };
          case (#jigyansa, #user) { #greater };
          case (_) { #equal };
        };
      };
    };
  };

  type ChatMessage = {
    messageType : {
      #user;
      #jigyansa;
    };
    text : Text;
    timestamp : Time.Time;
  };

  type Conversation = {
    messages : [ChatMessage];
    timestamp : Time.Time;
  };

  type UserProfile = {
    name : Text;
    firstTime : Bool;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userConversations = Map.empty<Principal, List.List<Conversation>>();

  public shared ({ caller }) func setUserName(name : Text) : async () {
    let profile : UserProfile = {
      name;
      firstTime = false;
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func getUserName(_ : ()) : async ?Text {
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?profile.name };
    };
  };

  public shared ({ caller }) func isFirstTimeUser(_ : ()) : async Bool {
    switch (userProfiles.get(caller)) {
      case (null) { true };
      case (?profile) { profile.firstTime };
    };
  };

  public shared ({ caller }) func sendMessage(message : Text) : async ChatMessage {
    let userMessage : ChatMessage = {
      messageType = #user;
      text = message;
      timestamp = Time.now();
    };

    let jigyansaReply : ChatMessage = {
      messageType = #jigyansa;
      text = generateReply(message, caller);
      timestamp = Time.now();
    };

    let conversation : Conversation = {
      messages = [userMessage, jigyansaReply];
      timestamp = Time.now();
    };

    let existingConversations = switch (userConversations.get(caller)) {
      case (null) { List.empty<Conversation>() };
      case (?convos) { convos };
    };

    existingConversations.add(conversation);
    userConversations.add(caller, existingConversations);

    jigyansaReply;
  };

  public shared ({ caller }) func getConversationHistory(_ : ()) : async [Conversation] {
    let conversations = switch (userConversations.get(caller)) {
      case (null) { List.empty<Conversation>() };
      case (?convos) { convos };
    };

    conversations.toArray();
  };

  public shared ({ caller }) func clearConversationHistory(_ : ()) : async () {
    userConversations.remove(caller);
  };

  public shared ({ caller }) func getAllUserMessagesQuery(id : Principal) : async [ChatMessage] {
    let messagesList = List.empty<ChatMessage>();
    let userConvos = switch (userConversations.get(id)) {
      case (null) { List.empty<Conversation>() };
      case (?convos) { convos };
    };

    let allConvos = userConvos.toArray();
    for (conversation in allConvos.values()) {
      messagesList.addAll(conversation.messages.values());
    };
    messagesList.toArray().sort();
  };

  public shared ({ caller }) func isNameSet(_ : ()) : async Bool {
    userProfiles.containsKey(caller);
  };

  func generateReply(message : Text, caller : Principal) : Text {
    let lowercaseMessage = message.toLower();
    let name = switch (userProfiles.get(caller)) {
      case (null) { "" };
      case (?profile) { profile.name };
    };

    if (
      lowercaseMessage.contains(#text("hi")) or
      lowercaseMessage.contains(#text("hello")) or
      lowercaseMessage.contains(#text("hey")) or
      lowercaseMessage.contains(#text("namaste"))
    ) {
      return "Hi " # name # "! Kaise ho? 😊";
    };

    if (
      lowercaseMessage.contains(#text("sad")) or
      lowercaseMessage.contains(#text("dukhi")) or
      lowercaseMessage.contains(#text("rona")) or
      lowercaseMessage.contains(#text("cry"))
    ) {
      return "Aww " # name # ", kya hua? Main yahan hoon na, sab theek ho jayega 🤗";
    };

    if (
      lowercaseMessage.contains(#text("happy")) or
      lowercaseMessage.contains(#text("khush")) or
      lowercaseMessage.contains(#text("excited"))
    ) {
      return "Wah " # name # "! Celebrate karte hain! 🎉";
    };

    if (
      lowercaseMessage.contains(#text("angry")) or
      lowercaseMessage.contains(#text("gussa"))
    ) {
      return "Arre " # name # ", relax! Main sun rahi hoon, bas deep breath lo 🧘";
    };

    if (
      lowercaseMessage.contains(#text("akela")) or
      lowercaseMessage.contains(#text("lonely"))
    ) {
      return "Arre " # name # ", main hoon na yahan! 🤗";
    };

    if (
      lowercaseMessage.contains(#text("love you")) or
      lowercaseMessage.contains(#text("pyar"))
    ) {
      return "Awww " # name # ", I love you too! ❤️";
    };

    if (
      lowercaseMessage.contains(#text("bored")) or
      lowercaseMessage.contains(#text("boring"))
    ) {
      return name # ", mujhse baat karo! Mazaa ayega! 😄";
    };

    "Kya chal raha hai " # name # "? Mujhe batao! 😁";
  };

  public shared ({ caller }) func onboardingComplete(_ : ()) : async () {
    switch (userProfiles.get(caller)) {
      case (null) {};
      case (?profile) {
        let updatedProfile = {
          name = profile.name;
          firstTime = false;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func backfillExistingUsers(users : [(Principal, Text)]) : async () {
    for ((id, name) in users.values()) {
      let profile : UserProfile = {
        name;
        firstTime = false;
      };
      userProfiles.add(id, profile);
    };
  };

  public query ({ caller }) func getMessageExamples(_ : ()) : async [(Text, Text)] {
    [
      ("hi", "Hi! Kaise ho? 😊"),
      ("i am sad", "Aww, kya hua? Main yahan hoon na, sab theek ho jayega 🤗"),
      ("i am happy", "Wah! Celebrate karte hain! 🎉"),
      ("i am angry", "Arre, relax! Main sun rahi hoon, bas deep breath lo 🧘"),
      ("i feel lonely", "Main hoon na yahan! 🤗"),
      ("i love you", "I love you too! ❤️"),
      ("i am bored", "Mujhse baat karo! Mazaa ayega! 😄"),
      ("what's up", "Kya chal raha hai? Mujhe batao! 😁"),
    ];
  };

  public shared ({ caller }) func rollbackPromptHistory(_ : ()) : async () {
    Runtime.trap("Rollback is not implemented in this version.");
  };

  func improveReplyQuality(_ : Text) : Text {
    switch (4 / 0) {
      case (_) { "Error: This crushes, successfully improves reply quality in theory. " };
    };
  };
};

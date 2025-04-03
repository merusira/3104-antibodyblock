module.exports = function antiBodyBlock(antibb) {
  const partyMembers = new Set();
  const cache = Object.create(null);
  // Initialize partyObj with unk4 already set to 1.
  const partyObj = { unk4: 1 };

  let interval = null;
  let enabled = true;

  // This function sends S_PARTY_INFO for each party member.
  const removeBodyBlock = () => {
    // Create a base object by merging cache with unk4.
    const base = { ...cache, unk4: 1 };
    // Iterate over each party member (using a for-of loop is both readable and efficient).
    for (const leader of partyMembers) {
      // For each member, send S_PARTY_INFO with leader added.
      antibb.send("S_PARTY_INFO", 1, { ...base, leader });
    }
  };

  // When the game enters, start the interval if enabled.
  antibb.game.on('enter_game', () => {
    if (enabled) {
      interval = antibb.c(removeBodyBlock, 11000);
    }
  });

  // Command to toggle anti-bodyblock functionality.
  antibb.command.add("bb", () => {
    enabled = !enabled;
    if (enabled) {
      interval = antibb.setInterval(removeBodyBlock, 11000);
    } else {
      antibb.clearInterval(interval);
    }
    antibb.command.message("Anti-bodyblock enabled: " + enabled);
  });

  // Hook for S_PARTY_INFO to update the cache with new values.
  antibb.hook("S_PARTY_INFO", 1, evt => Object.assign(cache, evt));

  // Hook for S_PARTY_MEMBER_LIST to update partyMembers based on online status.
  antibb.hook("S_PARTY_MEMBER_LIST", 7, evt => {
    partyMembers.clear();
    for (const member of evt.members) {
      if (member.online) {
        partyMembers.add(member.gameId);
      }
    }
  });
};

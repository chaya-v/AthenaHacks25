const fs = require('fs');

// Read user data from userData.json

const userData = JSON.parse(fs.readFileSync('userData.json', 'utf8'));

function getMatchingDates(startDate1, endDate1, startDate2, endDate2) {
    const start1 = new Date(startDate1);
    const end1 = new Date(endDate1);
    const start2 = new Date(startDate2);
    const end2 = new Date(endDate2);

    const matchingDates = [];
    for (let d = new Date(start1); d <= end1; d.setDate(d.getDate() + 1)) {
        if (d >= start2 && d <= end2) {
            matchingDates.push(new Date(d).toISOString().split('T')[0]);
        }
    }
    return matchingDates;
}

function matchUsers(data) {
    const matches = [];

    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            if (data[i].destination === data[j].destination) {
                const matchingDates = getMatchingDates(data[i].startDate, data[i].endDate, data[j].startDate, data[j].endDate);
                if (matchingDates.length > 0) {
                    matches.push({ user1: data[i], user2: data[j], matchingDates });
                }
            }
        }
    }

    return matches;
}

const matchedUsers = matchUsers(userData);

// Output matched users to a JSON file
fs.writeFileSync('matched_users.json', JSON.stringify(matchedUsers, null, 2));

console.log('Matched users have been saved to matched_users.json');
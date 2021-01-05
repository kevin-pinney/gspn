const Postgre = require('pg');
require('dotenv').config();
const client = new Postgre.Client({
    host: process.env.POSTGRE_HOST,
    port: process.env.POSTGRE_PORT,
    user: process.env.POSTGRE_USER,
    database: 'postgres',
    password: process.env.POSTGRE_PASSWORD
});

var connected = false;

;(async () => {
    await client.connect(error => {
        if (error) {
            console.error('Postgre connection error', error.stack)
        } else {
            console.log('Postgre connected')
        }
    });
})()

module.exports = {
    add_channel: (channelid, channelname) => {
        return new Promise((resolve, reject) => {
            var check = 
            'SELECT * FROM GSPN.channels WHERE ' +
            'channelid   = $1 AND ' +
            'channelname = $2;';
            var insert =
            'INSERT INTO GSPN.channels (channelid, channelname) VALUES ' +
            '($1, $2);';
            client.query(check, [channelid, channelname])
            .then(res => {
                if (res.rowCount == 0) {
                    return client.query(insert, [channelid, channelname])
                } else {
                    resolve(res);
                    return;
                }
            })
            .then(res => {
                if (!res) return
                console.log(`Inserted {${channelid}, ${channelname}} into channels`)
                resolve(res);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
        });
    },
    add_guild: (guildid, guildname) => {
        return new Promise((resolve, reject) => {
            var check = 
            'SELECT * FROM GSPN.guilds WHERE ' +
            'guildid   = $1 AND ' +
            'guildname = $2;';
            var insert =
            'INSERT INTO GSPN.guilds (guildid, guildname) VALUES ' +
            '($1, $2);';
            client.query(check, [guildid, guildname])
            .then(res => {
                if (res.rowCount == 0) {
                    return client.query(insert, [guildid, guildname])
                } else {
                    resolve(res);
                    return;
                }
            })
            .then(res => {
                if (!res) return
                console.log(`Inserted {${guildid}, ${guildname}} into guilds`)
                resolve(res);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
        });
    },
    add_twitter_account: (twitterid, handle) => {
        return new Promise((resolve, reject) => {
            var check = 
            'SELECT * FROM GSPN.twitteraccounts WHERE ' +
            'twitterid = $1 AND ' +
            'handle    = $2;';
            var insert =
            'INSERT INTO GSPN.twitteraccounts (twitterid, handle) VALUES ' +
            '($1, $2);';
            client.query(check, [twitterid, handle])
            .then(res => {
                if (res.rowCount == 0) {
                    return client.query(insert, [twitterid, handle])
                } else {
                    resolve(res);
                    return;
                }
            })
            .then(res => {
                if (!res) return;
                console.log(`Inserted {${twitterid}, ${handle}} into twitteraccounts`)
                resolve(res);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
        });
    },
    add_twitter_instance: (guildid, channelid, twitterid) => {
        return new Promise((resolve, reject) => {
            var check =
            'SELECT * FROM GSPN.twitterinstances WHERE ' +
            'guildid   = $1 AND ' +
            'channelid = $2 AND ' +
            'twitterid = $3;';
            var insert =
            'INSERT INTO GSPN.twitterinstances (guildid, channelid, twitterid) VALUES ' +
            '($1, $2, $3);';
            client.query(check, [guildid, channelid, twitterid])
            .then(res => {
                if (res.rowCount == 0) {
                    return client.query(insert, [guildid, channelid, twitterid])
                } else {
                    resolve(res);
                    return;
                }
            })
            .then(res => {
                if (!res) return
                console.log(`Inserted {${guildid}, ${channelid}, ${twitterid}} into instances`)
                resolve(res);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
        });
    },
    remove_twitter_instance: (guildid, channelid, twitterid) => {
        return new Promise((resolve, reject) => {
            var delete_instance = 
            'DELETE FROM GSPN.twitterinstances WHERE ' +
            'guildid = $1 AND ' +
            'channelid = $2 AND ' +
            'twitterid = $3;';
            var delete_guild = 'DELETE FROM GSPN.guilds WHERE guildid = $1;';
            var delete_channel = 'DELETE FROM GSPN.channels WHERE channelid = $1;';
            var delete_twitter_account = 'DELETE FROM GSPN.twitteraccounts WHERE twitterid = $1;';
            var delete_last_tweet = 'DELETE FROM GSPN.lasttweet WHERE twitterid = $1;';
            var check_guild = 'SELECT * FROM GSPN.twitterinstances WHERE guildid = $1;';
            var check_channel = 'SELECT * FROM GSPN.twitterinstances WHERE channelid = $1;';
            var check_twitter_account = 'SELECT * FROM GSPN.twitterinstances WHERE twitterid = $1;';
            client.query(delete_instance, [guildid, channelid, twitterid])
            .then(res => {
                if (res.rowCount == 0) {
                    reject({error:1})
                    return
                }
                return client.query(check_guild, [guildid]);
            })
            .then(res => {
                if (res.rowCount == 0) return client.query(delete_guild, [guildid])
            })
            .then(res => {
                return client.query(check_channel, [channelid]);
            })
            .then(res => {
                if (res.rowCount == 0) return client.query(delete_channel, [channelid])
            })
            .then(res => {
                return client.query(check_twitter_account, [twitterid]);
            })
            .then(res => {
                if (res.rowCount == 0) return client.query(delete_last_tweet, [twitterid]);
            })
            .then(res => {
                return client.query(check_twitter_account, [twitterid]);
            })
            .then(res => {
                if (res.rowCount == 0) return client.query(delete_twitter_account, [twitterid]);
            })
            .then(res => {
                resolve(res);
            })
            .catch(error => {
                reject(error);
            });
        });
    },
    get_all_twitter_accounts: () => {
        return new Promise((resolve, reject) => {
            var query =
            'SELECT A.twitterid, A.handle, B.tweetid FROM ' +
            'GSPN.twitteraccounts A INNER JOIN GSPN.lasttweet B ' +
            'ON A.twitterid = B.twitterid;';
            client.query(query)
            .then(res => {
                resolve(res);
            })
            .catch(error => {
                reject(error);
            });
        });
    },
    get_channels: (twitterid) => {
        return new Promise((resolve, reject) => {
            var query =
            'SELECT * FROM GSPN.twitterinstances WHERE ' +
            'twitterid = $1;';
            client.query(query, [twitterid])
            .then( res => {
                resolve(res);
            })
            .catch(error => {
                reject(error);
            });
        });
    },
    get_server_instances: (guildid) => {
        return new Promise((resolve, reject) => {
            var query =
            'SELECT B.handle, STRING_AGG(C.channelname, \',\') AS channels FROM (GSPN.twitterinstances A ' +
            'LEFT JOIN GSPN.twitteraccounts B ' +
            'ON A.twitterid = B.twitterid) LEFT JOIN GSPN.channels C ' +
            'ON A.channelid = C.channelid ' +
            'WHERE guildid = $1 ' +
            'GROUP BY B.handle;'
            client.query(query, [guildid])
            .then(res => {
                resolve(res);
            })
            .catch(error => {
                reject(error);
            });
        });
    },
    update_last_tweet_id: (twitterid, tweetid) => {
        return new Promise((resolve, reject) => {
            var check =
            'SELECT * FROM GSPN.lasttweet WHERE ' +
            'twitterid = $1;';
            var insert =
            'INSERT INTO GSPN.lasttweet (twitterid, tweetid) VALUES ' +
            '($1, $2);';
            client.query(check, [twitterid])
            .then(res => {
                if (res.rowCount == 0) return client.query(insert, [twitterid, tweetid]);
            })
            .then(res => {
                resolve();
            })
            .catch(error => {
                reject(error);
            });
        });
    },
}

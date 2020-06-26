
let Discord = require('discord.js')
let apiaiApp = require('apiai')
let auth = require(`./config.${process.env.NODE_ENV}.json`)

// Initialize Discord Bot
let chatApi = apiaiApp(auth.DIALOGFLOW_BOT_TOKEN)
let bot = new Discord.Client()
let hasVote = false;
let voteTitle = '';
let noTitleEntry = 0;
let voteEntries = [];


bot.on('ready', ()=> {
    console.log('Connected')
    console.log('Logged in as: ' + process.env.NODE_ENV + ' mode')
    console.log(bot.user.username + '- (' + bot.user.id + ')')    
});

//for spammingHandler
// const greenBotId = '603593622797156382';
bot.on('message', (message) => {
    // Avoid the bot to reply to itself
    if (message.author.bot) return
    logLine()
    const {channel, author: user, content, member} = message
    console.log('author name: ', user.username)
    console.log('member name: ', member.nickname )
    console.log('author id: ', user.id)
    console.log('content: ', content)
    
    if (content.substring(0, 1) == '!') {
        let args = content.substring(1).split(' ')
        let cmd = args[0]
        let [first, ...rest] = content.substring(1).split(' ')
        argsContent = rest.join(' ')
        switch(cmd) {
            case 'help':
                helpHandler({channel})
                break
            case 'hi':
                helloHandler({channel, user, member})
                break
            case 'banana':
                bananaHandler({channel})
                break
            case 'turnip':    
                message.react("712971888808165408")
                break
            case 'talk':    
                talkHandler({channel, text: argsContent || ''})
                break
            case 'voteCreate':
                voteCreate({channel, newVoteTitle: argsContent || ''})
                break
            case 'voteEnd':
                voteEnd({channel})
                break
            case 'voteAdd':
                voteEntryAdd({channel, entryTitle: argsContent || ''})
                break
            case 'vote':
                voteSelect({channel, selectEntry: argsContent || ''})
                break
            case 'voteStatus':
                voteDisplay({channel})
                break
            // case 'chat':
            //     chatHandler({channel, user, text: args[1] || ''})
            //     break;
            default:                
                console.log('unavailable command!')   
        }
    } else {
        // not cmd

        // react with turnip
        var turnipKeywords = ["turnip", "菜"]
        var hasTurnipInContent = turnipKeywords.some(k => content.includes(k))
        if (hasTurnipInContent) {
            message.react("712971888808165408")
        }

        // react with weather
        // var weatherKeywords = ["天氣", "溫度", "氣溫", "氣候", "雨", "太陽", "陰天", "濕度"]
        // var hasWeatherInContent = weatherKeywords.some(k => content.includes(k))
        // if (hasWeatherInContent) {
        // }
        chatHandler({channel, user, text: content || ''})
    }    

    
    // spamming handler
    // if(author.id === greenBotId){
    //     spammingHandler(channel)
    // }
});


bot.on('voiceStateUpdate', (oldState, newState) => {    
    const oldChannelId = oldState.channelID
    const newChannelId = newState.channelID
    
    const member = newState.member
    const user = newState.member.user; 
    const userId = user.id
    const username = user.username
    const nickname = member.nickname
    const newGuild = newState.guild
    const textChannel = getDefaultChannel(newGuild)
    
    if(!oldChannelId && newChannelId) {
        // User Joins a voice channel
        bot.channels.fetch(newChannelId)
            .then(channel => {
                logLine()
                console.log('user name: ' , username)
                console.log('user nickname: ' , nickname)
                console.log('user id: ' , userId)
                console.log('enter ' + channel.name)
                let showText = ' Welcome to ' + channel.name + ' !'
                textChannel.send(`<@${userId}> has joined ${channel.name}.`)
                helloHandler({channel: textChannel, user, member, text: showText})
            })
            .catch(console.error)
    } else if(!newChannelId){
        // User leaves a voice channel
        bot.channels.fetch(oldChannelId)
            .then(channel => {
                logLine()
                console.log('user name: ' , username)
                console.log('user nickname: ' , nickname)
                console.log('user id: ' , userId)
                console.log('leave ' + channel.name)
                textChannel.send(`<@${userId}> has left ${channel.name}.`)
                byeHandler({channel: textChannel, user, member})
            })
            .catch(console.error)
    }
});

const logLine = () => console.log('-----------------------------------------')
const helpHandler = ({channel}) => {
    const listText = "```commands list:\n!help\n!banana\n!turnip\n!talk [text]\n!chat [text]\n!voteCreate [text]\n!voteEnd [text]\n!voteAdd [text]\n!vote [index]\n!voteStatus\n```"
    channel.send(listText)
}

const talkHandler = ({channel, text = ''}) => {
    channel.send(text, {tts: true})
};


const voteCreate = ({channel, newVoteTitle = '新的投票'}) => {
    if (hasVote) {
        channel.send('一次只能建立一個投票, 可以用 !voteEnd 來結束投票')
    } else {
        hasVote = true        
        voteTitle = newVoteTitle || '新的投票'
        let listText = "```已建立投票: " + voteTitle + "!\n可以用 !voteAdd [entry] 來新增投票項目。```" 
        channel.send(listText)
    }
}

const voteEnd = ({channel}) => {
    if (hasVote) {
        channel.send('投票結束')
        if(voteEntries.length > 0) {
            let maxVote = -1
            let winners = []
            voteEntries.forEach((voteEntry)=>{
                if(voteEntry[1] > maxVote){
                    maxVote = voteEntry[1]
                    winners = [voteEntry[0]]
                } else if(voteEntry[1] === maxVote){
                    winners.push (voteEntry[0])
                }
            })
            let listText = "```最高票為:"  + maxVote + "票!\n項目是:\n"
            winners.forEach((winner)=>{
                listText += winner + "\n"
            })
            listText += "```"
            channel.send(listText)
        }
        hasVote = false
        voteTitle = ''
        voteEntries = []
    } else {
        channel.send('尚未舉行投票 !')
    }
}

const voteEntryAdd = ({channel, entryTitle = '新的項目'}) => {
    if (!hasVote) {
        channel.send('尚未舉行投票 !')
    } else {
        let newTitle = ''
        if(!entryTitle){
            noTitleEntry += 1;
            newTitle = '新的項目_' + noTitleEntry
        } else {
            newTitle = entryTitle
        }
        let titleIsExisted = false
        voteEntries.forEach(voteEntry => {
            if(voteEntry[0] === newTitle){
                titleIsExisted = true
            }
        })
        if(titleIsExisted) {
            channel.send('已建立的項目 !')
        } else {
            let newEntry = [newTitle, 0]
            voteEntries.push(newEntry)
            channel.send('新項目建立成功 !')
            voteDisplay({channel})
        }
    }
}

const voteSelect = ({channel, selectEntry = ''}) => {
    let selectIndices  = Array.from(new Set(selectEntry.split(' ')))
   
    
    if (!hasVote) {
        channel.send('尚未舉行投票 !')
        return
    } else if(!selectEntry) {
        channel.send('請輸入想投的編號')
        return
    } else if(selectIndices.length === 1){
        if(selectIndices[0] < 1 || selectIndices[0] > voteEntries.length || parseInt(selectIndices[0]) != selectIndices[0]){
            channel.send('請輸入正確的編號')
            return
        } 
    }
    
    selectIndices.forEach((selectIndex)=>{
        if(selectIndex < 1 || selectIndex > voteEntries.length || parseInt(selectIndex) != selectIndex){
            console.log('[voteSelect] not avaiable selectIndex')
        } else {
            voteEntryIndex = selectIndex - 1
            voteEntries[voteEntryIndex][1] += 1
        }
    })    
    voteDisplay({channel})
}

const voteDisplay = ({channel}) => {
    let text = ''
    if (!hasVote) {
        channel.send('尚未舉行投票 !')
    } else if(voteEntries.length === 0){
        text = '尚無投票項目! 請用 !voteAdd [entry] 來添加項目。'
        channel.send(text)
    }else {
        let listText = "```正在舉行投票: " + voteTitle +"\n"
        voteEntries.forEach((voteEntry, index) => {
            let entryIndex = index + 1
            text = entryIndex + " : " + voteEntry[0]+ " : " + voteEntry[1] +' 票\n';
            listText+= text
        })
        listText += "```"
        channel.send(listText)
    }
}

const chatHandler = ({channel, user, text = ''}) => {
    // Parse the text to the API.ai
    const userId = user.id
    var request = chatApi.textRequest(text, {
        sessionId: userId
    });
    // Listen to a response from API.ai
    request.on('response', (response) => {
        // Reply the user with the given response
        const botResponse = response.result.fulfillment.speech

        if(botResponse && botResponse !== 'no-city'){
            channel.send(response.result.fulfillment.speech)
        }
    });

    // Listen for any errors in the response
    request.on('error', (error) => {
        // Tell the user that an error happened
        console.log("Oops! There is an error in our end")
    });

    // End the request to avoid wasting memory
    request.end();
}

const helloHandler = ({channel, user, member, text}) => {
    const userId = user.id
    const username = user.username
    const nickname = member.nickname || user.username
    
    var randomNum = Math.floor(Math.random()*3)+1
    let helloContent = ''
    switch(randomNum) {
        case 1:
            helloContent += 'Hi, ' + username + ' .'
            break
        case 2:
            helloContent += 'Hello, ' + nickname + '.'
            break
        case 3:
            helloContent += 'HiHi, <@' + userId + '>.'
            break
        default:
            console.log('helloHandler unavailable!');
    }

    if (text) {
        helloContent += text
    }

    if (helloContent) {
        channel.send(helloContent)
    }    
};

const byeHandler = ({channel, user, member, text}) => {
    const userId = user.id
    const username = user.username
    const nickname = member.nickname || user.username
    
    var randomNum = Math.floor(Math.random()*3)+1
    let byeContent = ''
    switch(randomNum) {
        case 1:
            byeContent += 'Bye, ' + username + ' .'
            break
        case 2:
            byeContent += 'Good Bye, ' + nickname + '.'
            break
        case 3:
            byeContent += 'See you, <@' + userId + '>.'
            break
        default:
            console.log('byeHandler unavailable!')
    }

    if (text) {
        byeContent += text
    }

    if (byeContent) {
        channel.send(byeContent)
    }    
};

const bananaHandler = ({channel}) => {
    channel.send('ohohoh is bananananana!')
};

const getDefaultChannel = (guild) => {
    // get "original" default channel
    if(guild.channels.cache.has(guild.id))
      return guild.channels.cache.get(guild.id)
  
    // Check for a "general" channel, which is often default chat
    const generalChannel = guild.channels.cache.find(channel => channel.name === "general")
    if (generalChannel)
      return generalChannel
    // Now we get into the heavy stuff: first channel in order where the bot can speak
    return guild.channels
     .filter(c => c.type === "text" &&
       c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
     .sort((a, b) => a.position - b.position ||
       Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
     .first()
  }
// const spammingHandler = (channel) => {
//     var randomNum = Math.floor(Math.random()*2)+1;
//     switch(randomNum) {
//         case 1:
//             channel.send('ohohohoh is <@' + greenBotId + '>');
//             break;
//         case 2:
//             channel.send('<@' + greenBotId + '> go spamming!!!!');
//             break;
//         default:
//                 console.log('spammingHandler unavailable!'); 
//     }    
// };

bot.login(auth.DISCORD_BOT_TOKEN)

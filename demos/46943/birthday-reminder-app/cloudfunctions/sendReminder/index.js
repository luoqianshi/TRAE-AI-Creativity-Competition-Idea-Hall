/**
 * 发送提醒云函数
 * 定时触发：建议每小时执行一次
 * 发送当天已到提醒时间的 pending 状态提醒
 */

const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

// 祝福语模板
const WISH_TEMPLATES = {
  family: ['祝您生日快乐，身体健康，万事如意！', '愿您在新的一岁里平安喜乐，幸福美满！'],
  friend: ['生日快乐！愿你永远年轻，永远热泪盈眶！', '又长大一岁啦！祝你前程似锦，天天开心！'],
  colleague: ['祝您生日快乐，工作顺利，步步高升！', '生日快乐！愿您在事业上更上一层楼！'],
  other: ['祝您生日快乐，心想事成！', '生日快乐！愿您拥有美好的一天！']
}

function getRandomWish(relation) {
  const templates = WISH_TEMPLATES[relation] || WISH_TEMPLATES.other
  return templates[Math.floor(Math.random() * templates.length)]
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

exports.main = async (event, context) => {
  const now = new Date()
  const todayStr = formatDate(now)
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:00`

  try {
    // 1. 获取当天所有待发送的提醒
    const { data: pendingReminders } = await db.collection('reminder_logs')
      .where({
        scheduledDate: todayStr,
        status: 'pending'
      })
      .get()

    let sentCount = 0
    let failCount = 0

    for (const reminder of pendingReminders) {
      try {
        if (reminder.scheduledTime && reminder.scheduledTime > currentTime) {
          continue
        }

        // 获取生日记录详情
        const { data: birthdayDocs } = await db.collection('birthdays')
          .where({ _id: reminder.birthdayId })
          .get()

        if (birthdayDocs.length === 0) {
          await db.collection('reminder_logs').doc(reminder._id).update({
            data: { status: 'failed', errorMsg: '生日记录不存在' }
          })
          failCount++
          continue
        }

        const birthday = birthdayDocs[0]
        const wish = getRandomWish(birthday.relation)

        // 根据渠道发送提醒
        if (reminder.channel === 'wechat') {
          // 发送微信订阅消息
          // 注意：需要先在小程序中引导用户授权订阅消息
          await sendWechatReminder(reminder.userOpenId, birthday, wish)
        } else if (reminder.channel === 'email') {
          // 发送邮件（需要接入邮件服务）
          await sendEmailReminder(birthday.email, birthday.name, wish)
        }

        // 更新状态为已发送
        await db.collection('reminder_logs').doc(reminder._id).update({
          data: {
            status: 'sent',
            sentAt: db.serverDate()
          }
        })
        sentCount++
      } catch (err) {
        console.error(`发送提醒失败 [${reminder._id}]:`, err)
        await db.collection('reminder_logs').doc(reminder._id).update({
          data: { status: 'failed', errorMsg: err.message }
        })
        failCount++
      }
    }

    return {
      success: true,
      message: `发送完成：成功 ${sentCount} 条，失败 ${failCount} 条`,
      date: todayStr,
      sentCount,
      failCount
    }
  } catch (err) {
    console.error('发送提醒失败:', err)
    return { success: false, error: err.message }
  }
}

/**
 * 发送微信订阅消息
 * 需要在小程序中先引导用户授权
 */
async function sendWechatReminder(openid, birthday, wish) {
  try {
    await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: 'YOUR_TEMPLATE_ID', // 替换为你在微信公众平台申请的模板ID
      page: 'pages/index/index',
      data: {
        name1: { value: birthday.name },
        thing2: { value: wish },
        time3: { value: `${birthday.birthdayMonth}月${birthday.birthdayDay}日` }
      }
    })
  } catch (err) {
    console.error('微信消息发送失败:', err)
    throw err
  }
}

/**
 * 发送邮件提醒
 * 需要接入邮件服务（如 SendGrid、AWS SES 或自建 SMTP）
 * 以下为示例代码
 */
async function sendEmailReminder(email, name, wish) {
  // 示例：使用 SendGrid
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey('YOUR_SENDGRID_API_KEY')
  //
  // await sgMail.send({
  //   to: email,
  //   from: 'your-app@example.com',
  //   subject: `生日提醒：${name} 的生日快到了`,
  //   html: `
  //     <h2>生日提醒</h2>
  //     <p>您的好友 <strong>${name}</strong> 的生日即将到来！</p>
  //     <p>推荐祝福：${wish}</p>
  //     <p>别忘了送上您的祝福哦！</p>
  //   `
  // })

  console.log(`[邮件提醒] 发送至 ${email}: ${name}，${wish}`)
  // 实际接入时取消上面的注释并配置参数
}

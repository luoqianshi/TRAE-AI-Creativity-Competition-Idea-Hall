const generateMessage = function(data) {
  return new Promise((resolve, reject) => {
    try {
      const { scene, studentInfo, performance, style, channel } = data
      
      const improvement = performance.score && performance.lastScore 
        ? parseInt(performance.score) - parseInt(performance.lastScore)
        : null
      
      const scoreStatus = improvement !== null 
        ? (improvement > 0 ? `进步了${improvement}分` : improvement < 0 ? `下降了${Math.abs(improvement)}分` : '保持稳定')
        : ''
      
      let message = ''
      const suggestions = []
      
      switch(scene) {
        case '成绩进步':
          message = generateScoreImprovementMessage(studentInfo, performance, scoreStatus, style, channel)
          suggestions.push('可以建议家长适当给予奖励，增强孩子的学习动力')
          suggestions.push('提醒家长注意保持孩子的学习节奏，避免骄傲自满')
          break
          
        case '成绩退步':
          message = generateScoreDeclineMessage(studentInfo, performance, scoreStatus, style, channel)
          suggestions.push('建议家长与孩子沟通，了解成绩下降的原因')
          suggestions.push('提醒家长不要过度批评，以免打击孩子的自信心')
          suggestions.push('可以建议家长督促孩子复习薄弱知识点')
          break
          
        case '作业完成情况':
          message = generateHomeworkMessage(studentInfo, performance, style, channel)
          suggestions.push('提醒家长建立规律的作业时间')
          suggestions.push('建议家长检查孩子作业完成质量')
          break
          
        case '课堂表现':
          message = generateClassBehaviorMessage(studentInfo, performance, style, channel)
          suggestions.push('建议家长关注孩子在家的作息时间')
          suggestions.push('提醒家长与孩子沟通课堂表现的重要性')
          break
          
        case '知识点掌握情况':
          message = generateKnowledgeMessage(studentInfo, performance, style, channel)
          suggestions.push('建议家长为孩子提供额外的练习材料')
          suggestions.push('提醒家长鼓励孩子遇到问题及时请教')
          break
          
        case '家校配合请求':
          message = generateCooperationMessage(studentInfo, performance, style, channel)
          suggestions.push('保持友好的沟通态度，让家长感受到诚意')
          suggestions.push('明确提出具体的配合事项，避免模糊表述')
          break
          
        default:
          message = generateDefaultMessage(studentInfo, performance, style, channel)
      }
      
      resolve({
        success: true,
        message: message,
        suggestions: suggestions
      })
    } catch (error) {
      reject(error)
    }
  })
}

const generateScoreImprovementMessage = function(studentInfo, performance, scoreStatus, style, channel) {
  const baseMessage = `${studentInfo.name}家长您好！${studentInfo.name}这次${studentInfo.subject}考试取得了${performance.score}分的好成绩，${scoreStatus}`
  
  if (performance.rank) {
    baseMessage += `，班级排名第${performance.rank}名`
  }
  
  switch(style) {
    case '温和鼓励型':
      return `${baseMessage}，表现非常出色！孩子在学习上的努力值得肯定，建议继续保持这种学习状态。如果有任何问题，随时联系我。`
    case '专业直接型':
      return `${baseMessage}。该生近期学习状态良好，知识点掌握扎实。建议继续保持，争取更大进步。`
    case '建设性建议型':
      return `${baseMessage}，进步明显！建议重点巩固${performance.knowledge || '当前所学'}知识点，同时可以适当拓展一些难度较高的题目，进一步提升能力。`
    case '关怀提醒型':
      return `${baseMessage}，真是太棒了！请继续鼓励孩子保持这份学习热情，有需要帮助的地方随时告诉我。`
    default:
      return `${baseMessage}，表现优秀！请继续保持。`
  }
}

const generateScoreDeclineMessage = function(studentInfo, performance, scoreStatus, style, channel) {
  const baseMessage = `${studentInfo.name}家长您好，${studentInfo.name}这次${studentInfo.subject}考试${performance.score}分，${scoreStatus}`
  
  switch(style) {
    case '温和鼓励型':
      return `${baseMessage}。请不要过于担心，每个学生都会遇到学习上的波动。建议和孩子一起分析错题，找出问题所在。相信孩子调整状态后会有进步！`
    case '专业直接型':
      return `${baseMessage}。主要问题在${performance.knowledge || '基础知识点'}掌握不够扎实。建议周末针对性练习，如需帮助请联系我。`
    case '建设性建议型':
      return `${baseMessage}。分析原因主要是${performance.knowledge || '学习方法不当'}。建议：1. 每天花30分钟复习当天所学；2. 建立错题本；3. 遇到问题及时请教。我们一起帮助孩子进步！`
    case '关怀提醒型':
      return `${baseMessage}，请多关注孩子最近的学习状态。如有需要，我们可以一起商量帮助孩子的办法。`
    default:
      return `${baseMessage}，建议加强练习。`
  }
}

const generateHomeworkMessage = function(studentInfo, performance, style, channel) {
  switch(style) {
    case '温和鼓励型':
      return `尊敬的${studentInfo.name}家长您好！${studentInfo.name}同学的${studentInfo.subject}作业${performance.homework || '完成得很好'}，继续保持！如果孩子在作业中遇到困难，随时可以问我。`
    case '专业直接型':
      return `${studentInfo.name}家长您好，${studentInfo.name}的${studentInfo.subject}作业${performance.homework || '完成情况一般'}，请督促孩子按时完成作业。`
    case '建设性建议型':
      return `尊敬的${studentInfo.name}家长您好！${studentInfo.name}的${studentInfo.subject}作业${performance.homework || '存在一些问题'}，主要是${performance.knowledge || '解题思路不够清晰'}。建议在家多练习，巩固基础。`
    case '关怀提醒型':
      return `温馨提醒：${studentInfo.name}同学今天的${studentInfo.subject}作业还未提交，请家长督促孩子按时完成。如有特殊情况请告知，谢谢配合！`
    default:
      return `${studentInfo.name}家长您好，${studentInfo.name}的作业${performance.homework || '已完成'}。`
  }
}

const generateClassBehaviorMessage = function(studentInfo, performance, style, channel) {
  switch(style) {
    case '温和鼓励型':
      return `尊敬的${studentInfo.name}家长您好！${studentInfo.name}在${studentInfo.subject}课堂上${performance.classBehavior || '表现积极'}，经常主动回答问题，非常棒！请继续鼓励孩子。`
    case '专业直接型':
      return `${studentInfo.name}家长您好，${studentInfo.name}在${studentInfo.subject}课堂上${performance.classBehavior || '表现不佳'}，影响了学习效果。请关注孩子的状态。`
    case '建设性建议型':
      return `尊敬的${studentInfo.name}家长您好！最近观察到${studentInfo.name}在${studentInfo.subject}课堂上${performance.classBehavior || '注意力不集中'}。建议家长在家关注孩子的作息，确保充足睡眠，帮助孩子调整状态。`
    case '关怀提醒型':
      return `${studentInfo.name}家长您好，想和您沟通一下孩子的课堂表现。${studentInfo.name}最近在${studentInfo.subject}课上${performance.classBehavior || '有些走神'}，请多留意孩子最近的状态。`
    default:
      return `${studentInfo.name}家长您好，${studentInfo.name}课堂表现${performance.classBehavior || '正常'}。`
  }
}

const generateKnowledgeMessage = function(studentInfo, performance, style, channel) {
  switch(style) {
    case '温和鼓励型':
      return `尊敬的${studentInfo.name}家长您好！经过近期观察，${studentInfo.name}同学在${studentInfo.subject}的${performance.knowledge || '基础知识'}掌握得很扎实，继续加油！`
    case '专业直接型':
      return `${studentInfo.name}家长您好，${studentInfo.name}在${studentInfo.subject}的${performance.knowledge || '部分知识点'}掌握不够扎实，请加强练习。`
    case '建设性建议型':
      return `尊敬的${studentInfo.name}家长您好！${studentInfo.name}在${studentInfo.subject}的${performance.knowledge || '某些知识点'}上需要加强。建议：1. 每天做10道相关练习题；2. 复习课本例题；3. 整理错题。相信通过针对性练习，孩子会有很大进步！`
    case '关怀提醒型':
      return `${studentInfo.name}家长您好，想提醒您关注孩子在${studentInfo.subject}${performance.knowledge || '方面'}的学习情况。如有需要，我可以提供一些复习资料。`
    default:
      return `${studentInfo.name}家长您好，${studentInfo.name}知识点掌握${performance.knowledge || '良好'}。`
  }
}

const generateCooperationMessage = function(studentInfo, performance, style, channel) {
  switch(style) {
    case '温和鼓励型':
      return `尊敬的${studentInfo.name}家长您好！为了更好地帮助${studentInfo.name}同学提高${studentInfo.subject}成绩，希望我们能保持密切沟通。如果孩子在家有任何学习上的问题，欢迎随时和我交流。相信通过我们的共同努力，孩子一定会取得进步！`
    case '专业直接型':
      return `${studentInfo.name}家长您好，为了帮助${studentInfo.name}提高${studentInfo.subject}成绩，请配合以下几点：1. 监督完成作业；2. 定期检查错题本；3. 保证学习时间。感谢配合！`
    case '建设性建议型':
      return `尊敬的${studentInfo.name}家长您好！为了帮助${studentInfo.name}同学在${studentInfo.subject}上取得更好的成绩，我建议我们一起努力：\n1. 学校方面：我会重点关注孩子的课堂表现，及时反馈学习情况\n2. 家庭方面：请家长督促孩子每天完成作业，每周进行一次复习\n3. 沟通方面：建议我们每月至少沟通一次，了解孩子的学习状态\n\n让我们共同为孩子的成长努力！`
    case '关怀提醒型':
      return `${studentInfo.name}家长您好，希望我们能一起关注${studentInfo.name}的学习情况。如果有任何需要配合的地方，请随时告诉我，谢谢！`
    default:
      return `尊敬的${studentInfo.name}家长您好，希望我们能共同关注孩子的学习。`
  }
}

const generateDefaultMessage = function(studentInfo, performance, style, channel) {
  return `尊敬的${studentInfo.name}家长您好！${studentInfo.name}同学在${studentInfo.subject}学习方面${performance.knowledge || '表现正常'}。如有需要沟通的问题，随时联系我。`
}

module.exports = {
  generateMessage
}

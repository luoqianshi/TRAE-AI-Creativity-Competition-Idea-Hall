<template>
	<view class="page">
		<!-- 自定义顶部导航 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<text class="nav-title">{{ t('page.editor') }}</text>
			<view class="nav-lang"><LangSwitch /></view>
		</view>

		<!-- OC 选择器 -->
		<view class="oc-selector">
			<scroll-view scroll-x class="oc-scroll">
				<view class="oc-chip" v-for="oc in ocList" :key="oc.id"
					:class="{ active: selectedOCId === oc.id }" @click="selectOC(oc.id)">
					<text class="chip-emoji">{{ oc.emoji }}</text>
					<text class="chip-name">{{ oc.name }}</text>
				</view>
				<view class="oc-chip add-chip" @click="openNewOC">
					<text class="chip-emoji">＋</text>
					<text class="chip-name">{{ tt('新建') }}</text>
				</view>
				<view class="oc-chip add-chip" @click="showImportModal = true">
					<text class="chip-emoji">📥</text>
					<text class="chip-name">{{ tt('导入') }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 管理操作菜单 - 底部抽屉 -->
		<view class="sheet-mask" v-if="showOcActionSheet" @click="showOcActionSheet = false">
			<view class="sheet-card" @click.stop>
				<view class="sheet-handle"></view>
				<text class="sheet-title">{{ charData.name || tt('角色管理') }}</text>
				<view class="sheet-options">
					<view class="sheet-option" @click="showOcActionSheet = false; saveSetting()">
						<view class="sheet-option-icon-wrap" style="background: rgba(52,211,153,0.1);">
							<text class="sheet-option-icon">💾</text>
						</view>
						<view class="sheet-option-info">
							<text class="sheet-option-name">{{ tt('保存设定') }}</text>
							<text class="sheet-option-desc">{{ tt('保存当前角色的所有编辑内容') }}</text>
						</view>
					</view>
					<view class="sheet-option" @click="showOcActionSheet = false; showExportModal = true">
						<view class="sheet-option-icon-wrap" style="background: rgba(176,106,252,0.1);">
							<text class="sheet-option-icon">📤</text>
						</view>
						<view class="sheet-option-info">
							<text class="sheet-option-name">{{ tt('导出角色卡') }}</text>
							<text class="sheet-option-desc">{{ tt('将角色数据导出分享') }}</text>
						</view>
					</view>
					<view class="sheet-option" @click="showOcActionSheet = false; confirmDeleteOC(ocList.find(o => o.id === selectedOCId))">
						<view class="sheet-option-icon-wrap" style="background: rgba(239,68,68,0.1);">
							<text class="sheet-option-icon">🗑️</text>
						</view>
						<view class="sheet-option-info">
							<text class="sheet-option-name" style="color: #ef4444;">{{ tt('删除角色') }}</text>
							<text class="sheet-option-desc">{{ tt('永久删除该角色及其数据') }}</text>
						</view>
					</view>
				</view>
				<view class="sheet-cancel" @click="showOcActionSheet = false">
					<text class="sheet-cancel-text">{{ tt('取消') }}</text>
				</view>
			</view>
		</view>

		<!-- Tab 切换 -->
		<view class="tab-bar" v-if="ocList.length > 0">
				<view v-for="(tab, idx) in tabs" :key="idx" class="tab-item" :class="{ active: activeTab === idx }"
					@click="switchTab(idx)">
					<text class="tab-icon">{{ tab.icon }}</text>
					<text class="tab-text">{{ tab.label }}</text>
				</view>
			<view class="tab-item tab-item-manage" @click="showOcActionSheet = true">
				<text class="tab-icon">⚙️</text>
				<text class="tab-text">{{ tt('管理') }}</text>
			</view>
		</view>

		<!-- 编辑区域 -->
		<scroll-view scroll-y class="editor-scroll" v-if="ocList.length > 0">
			<!-- 角色卡编辑 -->
			<view v-if="activeTab === 0" class="editor-section">
				<view class="section-header">
					<text class="section-icon">🎭</text>
					<text class="section-title">{{ tt('角色基础设定') }}</text>
				</view>

				<!-- 角色头像上传 -->
				<view class="input-group">
					<text class="input-label">{{ tt('角色头像') }}</text>
					<view class="avatar-upload-area">
						<view class="avatar-preview" @click="chooseAvatar">
							<image v-if="charData.avatar" :src="charData.avatar" class="avatar-img" mode="aspectFill" />
							<text v-else class="avatar-emoji-large">{{ charData.emoji }}</text>
							<view class="avatar-camera"><text class="camera-icon">📷</text></view>
						</view>
						<view class="avatar-actions">
							<text class="avatar-hint">{{ tt('点击上传自定义头像') }}</text>
							<text v-if="charData.avatar" class="avatar-clear" @click="charData.avatar = ''">{{ tt('清除头像') }}</text>
						</view>
					</view>
				</view>

				<view class="input-group">
					<text class="input-label">{{ tt('角色名称') }}</text>
					<view class="glass-input">
						<input v-model="charData.name" :placeholder="tt('输入角色名...')" placeholder-class="placeholder" />
					</view>
				</view>

				<view class="input-group">
					<text class="input-label">{{ tt('角色称号') }}</text>
					<view class="glass-input">
						<input v-model="charData.title" :placeholder="tt('如：暗夜守护者')" placeholder-class="placeholder" />
					</view>
				</view>

				<view class="input-group">
					<text class="input-label">{{ tt('角色表情') }}</text>
					<view class="emoji-picker">
						<view v-for="e in emojiOptions" :key="e" class="emoji-option"
							:class="{ active: charData.emoji === e }" @click="charData.emoji = e">
							<text>{{ e }}</text>
						</view>
					</view>
				</view>

				<view class="input-group">
					<text class="input-label">{{ tt('配色方案') }}</text>
					<view class="theme-picker">
						<view v-for="(t, i) in ocThemes" :key="i" class="theme-option"
							:class="{ active: charData.themeIdx === i }"
							:style="{ background: t.gradient }" @click="charData.themeIdx = i">
							<text class="theme-name">{{ t.name }}</text>
						</view>
					</view>
				</view>

				<view class="input-group">
					<text class="input-label">{{ tt('角色背景故事') }}</text>
					<view class="glass-textarea">
						<view class="line-numbers">
							<text v-for="n in lineCount" :key="n" class="line-num">{{ n }}</text>
						</view>
						<textarea v-model="charData.story" :placeholder="tt('描述角色的背景故事...')"
							placeholder-class="placeholder" :auto-height="true" @input="updateLineCount" />
					</view>
				</view>

				<!-- 标签区 -->
				<view class="input-group">
					<text class="input-label">{{ tt('角色标签') }}</text>
					<view class="tags-area">
						<view v-for="(tag, idx) in charData.tags" :key="idx" class="tag-item">
							<text class="tag-text">{{ tag }}</text>
							<text class="tag-remove" @click="removeTag(idx)">×</text>
						</view>
						<view class="tag-add" @click="showTagInput = true" v-if="!showTagInput">
							<text class="tag-add-icon">+</text>
						</view>
						<view class="tag-input-wrap" v-if="showTagInput">
							<input v-model="newTag" :placeholder="tt('标签')" @confirm="addTag" @blur="addTag"
								placeholder-class="placeholder" focus />
						</view>
					</view>
				</view>

				<!-- 语音台词管理 -->
				<view class="input-group">
					<text class="input-label">{{ tt('语音台词（随机语音功能用）') }}</text>
					<view class="voice-list">
						<view v-for="(line, idx) in charData.voiceLines" :key="idx" class="voice-item">
							<text class="voice-num">{{ idx + 1 }}.</text>
							<input v-model="charData.voiceLines[idx]" class="voice-input" />
							<text class="voice-del" @click="charData.voiceLines.splice(idx, 1)">×</text>
						</view>
						<view class="add-voice" @click="charData.voiceLines.push('')">
							<text class="add-voice-text">{{ tt('+ 添加台词') }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 人设卡编辑 -->
			<view v-if="activeTab === 1" class="editor-section">
				<view class="section-header">
					<text class="section-icon">📋</text>
					<text class="section-title">{{ tt('详细人设卡') }}</text>
				</view>

				<!-- 身高 / 体重 -->
				<view class="input-group">
					<text class="input-label">{{ tt('身高 / 体重') }}</text>
					<view class="double-input">
						<view class="glass-input half">
							<input v-model="charData.height" :placeholder="tt('身高 cm')" placeholder-class="placeholder" />
						</view>
						<view class="glass-input half">
							<input v-model="charData.weight" :placeholder="tt('体重 kg')" placeholder-class="placeholder" />
						</view>
					</view>
				</view>

				<!-- 性格特质 -->
				<view class="input-group">
					<text class="input-label">{{ tt('性格特质') }}</text>
					<view class="preset-row">
						<view v-for="p in personalityOptions" :key="p.value" class="preset-chip"
							:class="{ active: charData.personality.includes(p.value) }"
							@click="togglePersonality(p.value)">
							<text>{{ p.label }}</text>
						</view>
					</view>
					<view class="tags-area" style="margin-top: 16rpx;">
						<view v-for="(t, idx) in charData.personality.filter(p => !personalityPresets.includes(p))" :key="idx" class="tag-item">
							<text class="tag-text">{{ t }}</text>
							<text class="tag-remove" @click="removePersonality(t)">×</text>
						</view>
						<view class="tag-add" @click="showPersonalityInput = true" v-if="!showPersonalityInput">
							<text class="tag-add-icon">+</text>
						</view>
						<view class="tag-input-wrap" v-if="showPersonalityInput">
							<input v-model="newPersonality" :placeholder="tt('自定义特质')" @confirm="addPersonality" @blur="addPersonality"
								placeholder-class="placeholder" focus />
						</view>
					</view>
				</view>

				<!-- 阵营倾向 -->
				<view class="input-group">
					<text class="input-label">{{ tt('阵营倾向') }}</text>
					<view class="alignment-grid">
						<view v-for="a in alignmentOptions" :key="a.value" class="alignment-cell"
							:class="{ active: charData.alignment === a.value }"
							@click="charData.alignment = charData.alignment === a.value ? '' : a.value">
							<text class="alignment-text">{{ a.label }}</text>
						</view>
					</view>
				</view>

				<!-- 战斗技能树 -->
				<view class="input-group">
					<text class="input-label">{{ tt('战斗技能树') }}</text>
					<view class="skill-list">
						<view v-for="(skill, idx) in charData.skills" :key="idx" class="skill-item">
							<input v-model="skill.name" class="skill-name-input" :placeholder="tt('技能名称')" placeholder-class="placeholder" />
							<view class="skill-stars">
								<text v-for="s in 5" :key="s" class="star"
									:class="{ active: s <= skill.level }"
									@click="skill.level = s">★</text>
							</view>
							<text class="skill-del" @click="charData.skills.splice(idx, 1)">×</text>
						</view>
						<view class="add-voice" @click="charData.skills.push({ name: '', level: 1 })">
							<text class="add-voice-text">{{ tt('+ 添加技能') }}</text>
						</view>
					</view>
				</view>

				<!-- 弱点 -->
				<view class="input-group">
					<text class="input-label">{{ tt('弱点') }}</text>
					<view class="tags-area">
						<view v-for="(w, idx) in charData.weaknesses" :key="idx" class="tag-item weakness-tag">
							<text class="tag-text">{{ w }}</text>
							<text class="tag-remove" @click="charData.weaknesses.splice(idx, 1)">×</text>
						</view>
						<view class="tag-add" @click="showWeaknessInput = true" v-if="!showWeaknessInput">
							<text class="tag-add-icon">+</text>
						</view>
						<view class="tag-input-wrap" v-if="showWeaknessInput">
							<input v-model="newWeakness" :placeholder="tt('输入弱点')" @confirm="addWeakness" @blur="addWeakness"
								placeholder-class="placeholder" focus />
						</view>
					</view>
				</view>

				<!-- 口头禅 -->
				<view class="input-group">
					<text class="input-label">{{ tt('口头禅') }}</text>
					<view class="voice-list">
						<view v-for="(line, idx) in charData.catchphrases" :key="idx" class="voice-item">
							<text class="voice-num">{{ idx + 1 }}.</text>
							<input v-model="charData.catchphrases[idx]" class="voice-input" :placeholder="tt('如：这就是命运吧...')" />
							<text class="voice-del" @click="charData.catchphrases.splice(idx, 1)">×</text>
						</view>
						<view class="add-voice" @click="charData.catchphrases.push('')">
							<text class="add-voice-text">{{ tt('+ 添加口头禅') }}</text>
						</view>
					</view>
				</view>

				<!-- 过去经历时间线 -->
				<view class="input-group">
					<text class="input-label">{{ tt('过去经历时间线') }}</text>
					<view class="timeline-list">
						<view v-for="(item, idx) in charData.timeline" :key="idx" class="timeline-item">
							<view class="timeline-marker">
								<view class="timeline-dot"></view>
								<view class="timeline-line" v-if="idx < charData.timeline.length - 1"></view>
							</view>
							<view class="timeline-content">
								<view class="glass-input timeline-time-input">
									<input v-model="item.time" :placeholder="tt('时间节点 如：十二岁那年')" placeholder-class="placeholder" />
								</view>
								<view class="glass-textarea timeline-event-input">
									<textarea v-model="item.event" :placeholder="tt('发生了什么...')" placeholder-class="placeholder" :auto-height="true" />
								</view>
								<text class="timeline-del" @click="charData.timeline.splice(idx, 1)">×</text>
							</view>
						</view>
						<view class="add-voice" @click="charData.timeline.push({ time: '', event: '' })">
							<text class="add-voice-text">{{ tt('+ 添加时间节点') }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 世界观编辑 -->
			<view v-if="activeTab === 2" class="editor-section">
				<view class="section-header">
					<text class="section-icon">🌍</text>
					<text class="section-title">{{ tt('世界观构筑') }}</text>
				</view>

				<view class="input-group">
					<text class="input-label">{{ tt('世界名称') }}</text>
					<view class="glass-input">
						<input v-model="worldData.name" :placeholder="tt('如：幻梦大陆')" placeholder-class="placeholder" />
					</view>
				</view>

				<view class="input-group">
					<text class="input-label">{{ tt('世界观描述') }}</text>
					<view class="glass-textarea">
						<view class="line-numbers">
							<text v-for="n in worldDescLines" :key="n" class="line-num">{{ n }}</text>
						</view>
						<textarea v-model="worldData.desc" :placeholder="tt('描述世界的基本法则、背景设定...')"
							placeholder-class="placeholder" :auto-height="true" @input="e => worldDescLines = Math.max(5, (e.detail.value||'').split('\\n').length)" />
					</view>
				</view>

				<view class="input-group">
					<text class="input-label">{{ tt('力量体系') }}</text>
					<view class="glass-textarea">
						<view class="line-numbers">
							<text v-for="n in powerLines" :key="n" class="line-num">{{ n }}</text>
						</view>
						<textarea v-model="worldData.powerSystem" :placeholder="tt('如：元素魔法分为火、水、风、土四系...')"
							placeholder-class="placeholder" :auto-height="true" @input="e => powerLines = Math.max(5, (e.detail.value||'').split('\\n').length)" />
					</view>
				</view>
			</view>

			<!-- 关系网 -->
			<view v-if="activeTab === 3" class="editor-section">
				<view class="section-header">
					<text class="section-icon">🔗</text>
					<text class="section-title">{{ tt('角色关系网') }}</text>
				</view>

				<view class="relation-graph">
					<view class="relation-center">
						<view class="relation-node main-node">
							<text class="node-emoji">{{ charData.emoji }}</text>
							<text class="node-name">{{ charData.name || tt('主角') }}</text>
						</view>
					</view>
					<view v-for="(rel, idx) in relations" :key="rel.id || idx" class="relation-item">
						<view class="relation-line" :style="{ background: rel.color }"></view>
						<view class="relation-node" :style="{ borderColor: rel.color }" @click="editRelation(idx)">
							<image v-if="rel.avatar" :src="rel.avatar" class="node-avatar" mode="aspectFill" />
							<text v-else class="node-emoji">{{ rel.emoji }}</text>
							<text class="node-name">{{ rel.name }}</text>
						</view>
						<view class="relation-labels">
							<view class="relation-label" :style="{ background: rel.color + '20', color: rel.color }">
								<text>{{ rel.asymmetric ? tt('我→') : '' }}{{ tt(rel.type) }}</text>
							</view>
							<view v-if="rel.asymmetric && rel.reverseType" class="relation-label reverse-label" :style="{ background: (rel.reverseColor || rel.color) + '20', color: rel.reverseColor || rel.color }">
								<text>{{ tt('对方→') }}{{ tt(rel.reverseType) }}</text>
							</view>
						</view>
						<text class="relation-del" @click="removeRelation(idx)">×</text>
					</view>
				</view>

				<view class="add-relation" @click="openAddRelation">
					<text class="add-icon">{{ tt('+ 添加关系') }}</text>
				</view>
			</view>

			<!-- 图片管理 -->
			<view v-if="activeTab === 4" class="editor-section">
				<view class="section-header">
					<text class="section-icon">🖼️</text>
					<text class="section-title">{{ tt('角色图片') }}</text>
				</view>

				<view class="media-upload-area" @click="chooseImages">
					<text class="media-upload-icon">📁</text>
					<text class="media-upload-text">{{ tt('点击上传图片') }}</text>
					<text class="media-upload-hint">{{ tt('支持立绘、表情包、设定图等') }}</text>
				</view>

				<view class="media-grid" v-if="charData.images && charData.images.length > 0">
					<view v-for="(img, idx) in charData.images" :key="img.id || idx" class="media-grid-item">
						<image :src="img.url" class="media-thumb" mode="aspectFill" />
						<view class="media-item-overlay">
							<text class="media-item-name">{{ img.name || tt('图片') + (idx + 1) }}</text>
						</view>
						<text class="media-item-del" @click="charData.images.splice(idx, 1)">×</text>
						<view v-if="img.type === 'generated'" class="media-badge">
							<text class="media-badge-text">AI</text>
						</view>
					</view>
				</view>

				<view class="media-empty" v-if="!charData.images || charData.images.length === 0">
					<text class="media-empty-icon">🎨</text>
					<text class="media-empty-text">{{ tt('还没有图片素材') }}</text>
					<text class="media-empty-hint">{{ tt('上传角色立绘、表情包，或后续使用 AI 生成') }}</text>
				</view>
			</view>

			<!-- 音频管理 -->
			<view v-if="activeTab === 5" class="editor-section">
				<view class="section-header">
					<text class="section-icon">🎵</text>
					<text class="section-title">{{ tt('角色音频') }}</text>
				</view>

				<view class="media-upload-area" @click="chooseAudios">
					<text class="media-upload-icon">🎙️</text>
					<text class="media-upload-text">{{ tt('点击上传音频') }}</text>
					<text class="media-upload-hint">{{ tt('支持角色语音、BGM、音效等') }}</text>
				</view>

				<view class="media-list" v-if="charData.audios && charData.audios.length > 0">
					<view v-for="(audio, idx) in charData.audios" :key="audio.id || idx" class="media-list-item">
						<view class="media-list-icon-wrap">
							<text class="media-list-icon">🎵</text>
						</view>
						<view class="media-list-info">
							<text class="media-list-name">{{ audio.name || tt('音频') + (idx + 1) }}</text>
							<text class="media-list-meta">{{ audio.duration || tt('未知时长') }}</text>
						</view>
						<view v-if="audio.type === 'generated'" class="media-badge media-badge-inline">
							<text class="media-badge-text">AI</text>
						</view>
						<text class="media-list-del" @click="charData.audios.splice(idx, 1)">×</text>
					</view>
				</view>

				<view class="media-empty" v-if="!charData.audios || charData.audios.length === 0">
					<text class="media-empty-icon">🔇</text>
					<text class="media-empty-text">{{ tt('还没有音频素材') }}</text>
					<text class="media-empty-hint">{{ tt('上传角色语音、BGM，或后续使用 AI 配音') }}</text>
				</view>
			</view>

			<!-- 视频管理 -->
			<view v-if="activeTab === 6" class="editor-section">
				<view class="section-header">
					<text class="section-icon">🎬</text>
					<text class="section-title">{{ tt('角色视频') }}</text>
				</view>

				<view class="media-upload-area" @click="chooseVideos">
					<text class="media-upload-icon">📹</text>
					<text class="media-upload-text">{{ tt('点击上传视频') }}</text>
					<text class="media-upload-hint">{{ tt('支持角色短视频、动态立绘等') }}</text>
				</view>

				<view class="media-grid" v-if="charData.videos && charData.videos.length > 0">
					<view v-for="(video, idx) in charData.videos" :key="video.id || idx" class="media-grid-item media-video-item">
						<image v-if="video.thumbnail" :src="video.thumbnail" class="media-thumb" mode="aspectFill" />
						<view v-else class="media-thumb media-thumb-placeholder">
							<text class="media-thumb-placeholder-icon">🎬</text>
						</view>
						<view class="media-item-overlay">
							<text class="media-item-name">{{ video.name || tt('视频') + (idx + 1) }}</text>
							<text class="media-item-duration" v-if="video.duration">{{ video.duration }}</text>
						</view>
						<view class="media-play-btn">
							<text class="media-play-icon">▶</text>
						</view>
						<text class="media-item-del" @click="charData.videos.splice(idx, 1)">×</text>
						<view v-if="video.type === 'generated'" class="media-badge">
							<text class="media-badge-text">AI</text>
						</view>
					</view>
				</view>

				<view class="media-empty" v-if="!charData.videos || charData.videos.length === 0">
					<text class="media-empty-icon">📽️</text>
					<text class="media-empty-text">{{ tt('还没有视频素材') }}</text>
					<text class="media-empty-hint">{{ tt('上传角色短视频，或后续使用 AI 生成动态内容') }}</text>
				</view>
			</view>

			<!-- 预览区 -->
			<view class="preview-section" v-if="activeTab === 0">
				<view class="section-header">
					<text class="section-icon">👁️</text>
					<text class="section-title">{{ tt('设定预览') }}</text>
				</view>
				<view class="preview-card">
					<view class="preview-watermark">
						<text v-for="i in 6" :key="i" class="watermark-text">{{ charData.name || 'OC' }} ORIGINAL</text>
					</view>
					<view class="preview-content">
						<view class="preview-header-row">
							<text class="preview-emoji">{{ charData.emoji }}</text>
							<view>
								<text class="preview-name">{{ charData.name || tt('未命名角色') }}</text>
								<text class="preview-title">{{ charData.title || tt('无称号') }}</text>
							</view>
						</view>
						<text class="preview-story">{{ charData.story || tt('暂无背景故事...') }}</text>
						<view class="preview-tags">
							<text v-for="(tag, idx) in charData.tags" :key="idx" class="preview-tag">{{ tag }}</text>
						</view>
					</view>
				</view>
			</view>

			<view style="height: 200rpx;"></view>
		</scroll-view>


		<!-- 空状态 -->
		<view class="empty-state" v-if="ocList.length === 0">
			<view class="empty-glow"></view>
			<text class="empty-emoji">🌟</text>
			<text class="empty-title">{{ tt('还没有 OC 角色') }}</text>
			<text class="empty-desc">{{ tt('点击下方按钮，开始创造你的第一个角色') }}</text>
			<view class="empty-btn" @click="openNewOC">
				<text class="empty-btn-text">{{ tt('✨ 创建角色') }}</text>
			</view>
		</view>

		<!-- Canvas 用于图片角色卡生成 -->
		<canvas canvas-id="ocCardCanvas" class="offscreen-canvas" style="width: 375px; height: 560px; position: fixed; left: -9999px; top: -9999px;"></canvas>

		<!-- 导出弹窗 - 底部抽屉 -->
		<view class="sheet-mask" v-if="showExportModal" @click="showExportModal = false">
			<view class="sheet-card" @click.stop>
				<view class="sheet-handle"></view>
				<text class="sheet-title">{{ tt('导出角色卡') }}</text>
				<view class="sheet-options">
					<view class="sheet-option" @click="doExportJSON">
						<view class="sheet-option-icon-wrap" style="background: rgba(176,106,252,0.1);">
							<text class="sheet-option-icon">📋</text>
						</view>
						<view class="sheet-option-info">
							<text class="sheet-option-name">{{ tt('导出为 JSON') }}</text>
							<text class="sheet-option-desc">{{ tt('复制当前角色数据到剪贴板') }}</text>
						</view>
					</view>
					<view class="sheet-option" @click="doExportImage">
						<view class="sheet-option-icon-wrap" style="background: rgba(244,114,182,0.1);">
							<text class="sheet-option-icon">🖼️</text>
						</view>
						<view class="sheet-option-info">
							<text class="sheet-option-name">{{ tt('导出为图片') }}</text>
							<text class="sheet-option-desc">{{ tt('生成角色卡图片并保存到相册') }}</text>
						</view>
					</view>
					<view class="sheet-option" @click="doExportAll">
						<view class="sheet-option-icon-wrap" style="background: rgba(96,165,250,0.1);">
							<text class="sheet-option-icon">💾</text>
						</view>
						<view class="sheet-option-info">
							<text class="sheet-option-name">{{ tt('全量备份') }}</text>
							<text class="sheet-option-desc">{{ tt('导出所有 OC 数据到剪贴板') }}</text>
						</view>
					</view>
				</view>
				<view class="sheet-cancel" @click="showExportModal = false">
					<text class="sheet-cancel-text">{{ tt('取消') }}</text>
				</view>
			</view>
		</view>

		<!-- 导入弹窗 - 底部抽屉 -->
		<view class="sheet-mask" v-if="showImportModal" @click="showImportModal = false">
			<view class="sheet-card" @click.stop>
				<view class="sheet-handle"></view>
				<text class="sheet-title">{{ tt('导入角色卡') }}</text>
				<view class="sheet-options">
					<view class="sheet-option" @click="doImportFromClipboard">
						<view class="sheet-option-icon-wrap" style="background: rgba(176,106,252,0.1);">
							<text class="sheet-option-icon">📋</text>
						</view>
						<view class="sheet-option-info">
							<text class="sheet-option-name">{{ tt('从剪贴板导入') }}</text>
							<text class="sheet-option-desc">{{ tt('读取剪贴板中的 JSON 数据') }}</text>
						</view>
					</view>
					<view class="sheet-option" @click="doImportFromInput">
						<view class="sheet-option-icon-wrap" style="background: rgba(244,114,182,0.1);">
							<text class="sheet-option-icon">📝</text>
						</view>
						<view class="sheet-option-info">
							<text class="sheet-option-name">{{ tt('手动粘贴导入') }}</text>
							<text class="sheet-option-desc">{{ tt('在输入框中粘贴 JSON 数据') }}</text>
						</view>
					</view>
				</view>
				<view class="sheet-cancel" @click="showImportModal = false">
					<text class="sheet-cancel-text">{{ tt('取消') }}</text>
				</view>
			</view>
		</view>

		<!-- 手动粘贴导入弹窗 - 底部抽屉 -->
		<view class="sheet-mask" v-if="showImportInput" @click="showImportInput = false">
			<view class="sheet-card" @click.stop>
				<view class="sheet-handle"></view>
				<text class="sheet-title">{{ tt('粘贴 JSON 数据') }}</text>
				<view class="sheet-body">
					<view class="glass-textarea" style="min-height: 300rpx;">
						<textarea v-model="importJsonText" :placeholder="tt('在此粘贴导出的 JSON 数据...')" placeholder-class="placeholder" :auto-height="true" style="min-height: 280rpx; width: 100%; font-size: 24rpx;" />
					</view>
				</view>
				<view class="sheet-btn-row">
					<view class="sheet-btn sheet-btn-cancel" @click="showImportInput = false"><text>{{ tt('取消') }}</text></view>
					<view class="sheet-btn sheet-btn-confirm" @click="doImportFromText"><text>{{ tt('导入') }}</text></view>
				</view>
			</view>
		</view>

		<!-- 关系编辑弹窗 - 底部抽屉 -->
		<view class="sheet-mask" v-if="showRelationModal" @click="showRelationModal = false">
			<view class="sheet-card sheet-card-tall" @click.stop>
				<view class="sheet-handle"></view>
				<text class="sheet-title">{{ editingRelId ? tt('编辑关系') : tt('添加关系') }}</text>

				<scroll-view scroll-y class="sheet-scroll-body">
					<view class="sheet-body">
						<view class="input-group">
							<text class="input-label">{{ tt('角色名') }}</text>
							<view class="glass-input">
								<input v-model="relDraft.name" :placeholder="tt('输入角色名...')" placeholder-class="placeholder" />
							</view>
						</view>

						<view class="input-group">
							<text class="input-label">{{ tt('角色头像') }}</text>
							<view class="rel-avatar-area">
								<view class="rel-avatar-preview" @click="chooseRelAvatar">
									<image v-if="relDraft.avatar" :src="relDraft.avatar" class="rel-avatar-img" mode="aspectFill" />
									<text v-else class="rel-avatar-emoji">{{ relDraft.emoji }}</text>
									<view class="rel-avatar-camera"><text class="camera-icon">📷</text></view>
								</view>
								<view class="rel-avatar-actions">
									<text class="avatar-hint">{{ tt('点击上传自定义头像') }}</text>
									<text v-if="relDraft.avatar" class="avatar-clear" @click.stop="relDraft.avatar = ''">{{ tt('清除头像') }}</text>
								</view>
							</view>
						</view>

						<view class="input-group">
							<text class="input-label">{{ tt('表情（无头像时显示）') }}</text>
							<view class="emoji-picker small">
								<view v-for="e in relEmojiOptions" :key="e" class="emoji-option"
									:class="{ active: relDraft.emoji === e }" @click="relDraft.emoji = e">
									<text>{{ e }}</text>
								</view>
							</view>
						</view>

						<view class="input-group">
							<text class="input-label">{{ relDraft.asymmetric ? tt('我方视角（我→对方）') : tt('关系类型') }}</text>
							<view class="type-picker">
								<view v-for="t in relationTypeOptions" :key="t.value" class="type-chip"
									:class="{ active: relDraft.type === t.value }"
									:style="relDraft.type === t.value ? { background: t.color + '20', borderColor: t.color, color: t.color } : {}"
									@click="relDraft.type = t.value; relDraft.color = t.color; if (!relDraft.asymmetric) { relDraft.reverseType = t.value; relDraft.reverseColor = t.color }">
									<text>{{ t.label }}</text>
								</view>
							</view>
						</view>

						<view class="input-group">
							<view class="asymmetric-toggle" @click="relDraft.asymmetric = !relDraft.asymmetric">
								<view class="toggle-track" :class="{ on: relDraft.asymmetric }">
									<view class="toggle-thumb"></view>
								</view>
								<text class="toggle-label">{{ tt('不对称关系') }}</text>
								<text class="toggle-hint">{{ tt('（A 和 B 对彼此的看法不同）') }}</text>
							</view>
						</view>

						<view class="input-group" v-if="relDraft.asymmetric">
							<text class="input-label">{{ tt('对方视角（对方→我）') }}</text>
							<view class="type-picker">
								<view v-for="t in relationTypeOptions" :key="'rev_'+t.value" class="type-chip"
									:class="{ active: relDraft.reverseType === t.value }"
									:style="relDraft.reverseType === t.value ? { background: t.color + '20', borderColor: t.color, color: t.color } : {}"
									@click="relDraft.reverseType = t.value; relDraft.reverseColor = t.color">
									<text>{{ t.label }}</text>
								</view>
							</view>
						</view>

						<view class="input-group" v-if="relDraft.asymmetric && relDraft.name.trim()">
							<text class="input-label">{{ tt('关系预览') }}</text>
							<view class="asymmetric-preview">
								<view class="preview-row">
									<text class="preview-oc-name">{{ charData.name || tt('我') }}</text>
									<view class="preview-arrow" :style="{ background: relDraft.color + '20' }">
										<text class="preview-arrow-text" :style="{ color: relDraft.color }">→ {{ tt(relDraft.type) }}</text>
									</view>
									<text class="preview-oc-name">{{ relDraft.name }}</text>
								</view>
								<view class="preview-row">
									<text class="preview-oc-name">{{ relDraft.name }}</text>
									<view class="preview-arrow" :style="{ background: relDraft.reverseColor + '20' }">
										<text class="preview-arrow-text" :style="{ color: relDraft.reverseColor }">→ {{ tt(relDraft.reverseType) }}</text>
									</view>
									<text class="preview-oc-name">{{ charData.name || tt('我') }}</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>

				<view class="sheet-btn-row">
					<view class="sheet-btn sheet-btn-cancel" @click="showRelationModal = false"><text>{{ tt('取消') }}</text></view>
					<view class="sheet-btn sheet-btn-confirm" @click="confirmRelation"><text>{{ tt('确定') }}</text></view>
				</view>
			</view>
		</view>

		<!-- 新建 OC 弹窗 - 底部抽屉 -->
		<view class="sheet-mask" v-if="showNewOC" @click="showNewOC = false">
			<view class="sheet-card sheet-card-tall" @click.stop>
				<view class="sheet-handle"></view>
				<text class="sheet-title">{{ tt('创建新角色') }}</text>
				<scroll-view scroll-y class="sheet-scroll-body">
					<view class="sheet-body">
						<view class="input-group">
							<text class="input-label">{{ tt('角色名称') }}</text>
							<view class="glass-input">
								<input v-model="newOCDraft.name" :placeholder="tt('如：星渊·Abyss')" placeholder-class="placeholder" />
							</view>
						</view>
						<view class="input-group">
							<text class="input-label">{{ tt('角色称号') }}</text>
							<view class="glass-input">
								<input v-model="newOCDraft.title" :placeholder="tt('如：暗夜守护者')" placeholder-class="placeholder" />
							</view>
						</view>
						<view class="input-group">
							<text class="input-label">{{ tt('角色表情') }}</text>
							<view class="emoji-picker">
								<view v-for="e in emojiOptions" :key="e" class="emoji-option"
									:class="{ active: newOCDraft.emoji === e }" @click="newOCDraft.emoji = e">
									<text>{{ e }}</text>
								</view>
							</view>
						</view>
						<view class="input-group">
							<text class="input-label">{{ tt('配色方案') }}</text>
							<view class="theme-picker">
								<view v-for="(t, i) in ocThemes" :key="i" class="theme-option"
									:class="{ active: newOCDraft.themeIdx === i }"
									:style="{ background: t.gradient }" @click="newOCDraft.themeIdx = i">
									<text class="theme-name">{{ t.name }}</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="sheet-btn-row">
					<view class="sheet-btn sheet-btn-cancel" @click="showNewOC = false"><text>{{ tt('取消') }}</text></view>
					<view class="sheet-btn sheet-btn-confirm" @click="confirmNewOC"><text>{{ tt('创建') }}</text></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import LangSwitch from '../../components/LangSwitch.vue'
import { useI18n } from '../../utils/i18n.js'
import {
	consumeTargetEditorTab,
	saveOCList,
	saveWorldData,
	saveRelations,
	deleteOC as deleteLocalOC,
	getChatMessages,
	saveChatMessages,
	RELATION_TYPES,
	RELATION_COLORS,
	RELATION_EMOJIS,
	OC_THEMES
} from '../../utils/store.js'
import {
	fetchOCs,
	createOC,
	fetchOCDetail,
	updateOC,
	deleteOCById,
	fetchWorld,
	saveWorld,
	fetchRelations,
	createRelation,
	updateRelation,
	deleteRelation
} from '../../api/oc.js'
import { uploadMedia } from '../../utils/apis/media.js'

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 44
const { t, tt } = useI18n()

const tabs = computed(() => [
	{ label: tt('角色卡'), icon: '🎭' },
	{ label: tt('人设卡'), icon: '📋' },
	{ label: tt('世界观'), icon: '🌍' },
	{ label: tt('关系网'), icon: '🔗' },
	{ label: tt('图片'), icon: '🖼️' },
	{ label: tt('音频'), icon: '🎵' },
	{ label: tt('视频'), icon: '🎬' }
])
const emojiOptions = ['🌙', '🌸', '💎', '🔥', '⭐', '🌊', '⚡', '🦊', '🐉', '🎭', '🗡️', '🛡️']
const relEmojiOptions = [...new Set([...RELATION_EMOJIS, '🌙', '💎', '🔥', '⚡', '🌊', '🦊'])]
const relationTypes = RELATION_TYPES
const relationColors = RELATION_COLORS
const personalityPresets = ['温柔', '冷酷', '热血', '腹黑', '傲娇', '天然呆', '毒舌', '忠诚', '孤僻', '乐观', '沉稳', '狡猾']
const alignments = ['守序善良', '中立善良', '混沌善良', '守序中立', '绝对中立', '混沌中立', '守序邪恶', '中立邪恶', '混沌邪恶']
const personalityOptions = computed(() => personalityPresets.map(value => ({
	value,
	label: tt(value),
})))
const alignmentOptions = computed(() => alignments.map(value => ({
	value,
	label: tt(value),
})))
const relationTypeOptions = computed(() => relationTypes.map((value, index) => ({
	value,
	label: tt(value),
	color: relationColors[index],
})))
const ocThemes = computed(() => OC_THEMES.map(theme => ({
	...theme,
	name: tt(theme.name),
})))

const activeTab = ref(0)
const showTagInput = ref(false)
const newTag = ref('')
const lineCount = ref(5)
const worldDescLines = ref(5)
const powerLines = ref(5)

// OC 选择
const ocList = ref([])
const selectedOCId = ref(null)

// 当前编辑数据
const charData = ref(createEmptyCharData())
const worldData = ref(createEmptyWorldData())
const allRelations = ref([])
const relations = ref([])
const initialLoaded = ref(false)

// 关系弹窗
const showRelationModal = ref(false)
const editingRelId = ref(null)
const relDraft = ref(createEmptyRelationDraft())

// OC 操作菜单
const showOcActionSheet = ref(false)

// 新建 OC 弹窗
const showNewOC = ref(false)
const newOCDraft = ref(createEmptyNewOCDraft())

// 人设卡相关
const showPersonalityInput = ref(false)
const newPersonality = ref('')
const showWeaknessInput = ref(false)
const newWeakness = ref('')

function formatI18nText(template, vars = {}) {
	let text = tt(template)
	Object.entries(vars).forEach(([key, value]) => {
		text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
	})
	return text
}

function togglePersonality(p) {
	const idx = charData.value.personality.indexOf(p)
	if (idx >= 0) charData.value.personality.splice(idx, 1)
	else charData.value.personality.push(p)
}
function removePersonality(p) {
	const idx = charData.value.personality.indexOf(p)
	if (idx >= 0) charData.value.personality.splice(idx, 1)
}
function addPersonality() {
	if (newPersonality.value.trim() && !charData.value.personality.includes(newPersonality.value.trim())) {
		charData.value.personality.push(newPersonality.value.trim())
	}
	newPersonality.value = ''
	showPersonalityInput.value = false
}
function addWeakness() {
	if (newWeakness.value.trim()) charData.value.weaknesses.push(newWeakness.value.trim())
	newWeakness.value = ''
	showWeaknessInput.value = false
}

async function loadData() {
	try {
		const [ocsRes, worldRes, relationsRes] = await Promise.all([
			fetchOCs(),
			fetchWorld(),
			fetchRelations()
		])

		ocList.value = (Array.isArray(ocsRes.data) ? ocsRes.data : ocsRes).map(normalizeOC)
		worldData.value = normalizeWorld(worldRes.data || worldRes)
		allRelations.value = (Array.isArray(relationsRes.data) ? relationsRes.data : relationsRes).map(normalizeRelation)

		if (ocList.value.length === 0) {
			selectedOCId.value = null
			charData.value = createEmptyCharData()
			relations.value = []
		} else {
			const nextSelectedId = ocList.value.find(o => o.id === selectedOCId.value)?.id || ocList.value[0].id
			await selectOC(nextSelectedId)
		}

		syncLocalMirror()
		initialLoaded.value = true
	} catch (error) {
		if (!initialLoaded.value) {
			uni.showToast({ title: error.message || tt('加载设定失败'), icon: 'none' })
		}
	}
}

async function selectOC(id) {
	if (!id) return
	selectedOCId.value = id
	let oc = ocList.value.find(o => o.id === id)
	try {
		const detailRes = await fetchOCDetail(id)
		oc = normalizeOC(detailRes.data || detailRes)
		upsertOC(oc)
	} catch (error) {
		// 列表里已有数据时保持当前可编辑状态，不额外打断
	}

	if (oc) {
		charData.value = {
			name: oc.name,
			title: oc.title,
			emoji: oc.emoji,
			avatar: oc.avatar || '',
			story: oc.story,
			tags: [...oc.tags],
			voiceLines: [...(oc.voiceLines || [])],
			height: oc.height || '',
			weight: oc.weight || '',
			personality: [...(oc.personality || [])],
			alignment: oc.alignment || '',
			skills: (oc.skills || []).map(s => ({ ...s })),
			weaknesses: [...(oc.weaknesses || [])],
			catchphrases: [...(oc.catchphrases || [])],
			timeline: (oc.timeline || []).map(t => ({ ...t })),
			themeIdx: ocThemes.value.findIndex(t => t.gradient === oc.gradient) >= 0
				? ocThemes.value.findIndex(t => t.gradient === oc.gradient) : 0,
			images: (oc.images || []).map(i => ({ ...i })),
			audios: (oc.audios || []).map(a => ({ ...a })),
			videos: (oc.videos || []).map(v => ({ ...v })),
		}
		lineCount.value = Math.max(5, (oc.story || '').split('\n').length)
		relations.value = allRelations.value.filter(r => Number(r.ocId) === Number(id))
	}
}

onMounted(loadData)
onShow(() => {
	if (initialLoaded.value) loadData()
	const targetTab = consumeTargetEditorTab()
	if (targetTab >= 0) activeTab.value = targetTab
})

function chooseAvatar() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			const tempPath = res.tempFilePaths[0]
			charData.value.avatar = tempPath
			try {
				const uploaded = await uploadMedia({
					filePath: tempPath,
					bizType: 'oc_avatar',
					bizId: selectedOCId.value,
					fileType: 'image'
				})
				const avatarUrl = uploaded.path || uploaded.url || tempPath
				charData.value.avatar = avatarUrl
				const ocRes = await updateOC(selectedOCId.value, { avatar: avatarUrl })
				upsertOC(normalizeOC(ocRes.data || ocRes))
				syncLocalMirror()
				uni.$emit('refreshIndex')
			} catch (e) {
				uni.showToast({ title: tt('头像上传失败，请重试'), icon: 'none' })
				charData.value.avatar = ''
			}
		}
	})
}

function chooseImages() {
	uni.chooseImage({
		count: 9,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			const newItems = res.tempFilePaths.map((path, i) => ({
				id: Date.now() + '_' + i,
				url: path,
				name: '',
				type: 'upload'
			}))
			charData.value.images.push(...newItems)
		}
	})
}

function chooseAudios() {
	// #ifdef MP-WEIXIN
	wx.chooseMessageFile({
		count: 9,
		type: 'file',
		extension: ['.mp3', '.wav', '.aac', '.m4a', '.ogg'],
		success: (res) => {
			const newItems = res.tempFiles.map((file, i) => ({
				id: Date.now() + '_' + i,
				url: file.path,
				name: file.name || '',
				duration: '',
				type: 'upload'
			}))
			charData.value.audios.push(...newItems)
		}
	})
	// #endif
	// #ifdef H5
	uni.showToast({ title: tt('请在小程序端上传音频'), icon: 'none' })
	// #endif
}

function chooseVideos() {
	uni.chooseVideo({
		sourceType: ['album', 'camera'],
		compressed: true,
		success: (res) => {
			charData.value.videos.push({
				id: Date.now() + '_0',
				url: res.tempFilePath,
				name: '',
				duration: res.duration ? Math.round(res.duration) + 's' : '',
				thumbnail: res.thumbTempFilePath || '',
				type: 'upload'
			})
		}
	})
}

function switchTab(idx) { activeTab.value = idx }

function updateLineCount(e) {
	lineCount.value = Math.max(5, (e.detail.value || '').split('\n').length)
}

function addTag() {
	if (newTag.value.trim()) {
		charData.value.tags.push(newTag.value.trim())
		newTag.value = ''
	}
	showTagInput.value = false
}

function removeTag(idx) { charData.value.tags.splice(idx, 1) }

// 关系管理
function openAddRelation() {
	editingRelId.value = null
	relDraft.value = createEmptyRelationDraft()
	showRelationModal.value = true
}

function editRelation(idx) {
	const r = relations.value[idx]
	editingRelId.value = r?.id || null
	relDraft.value = {
		name: r.name, emoji: r.emoji, avatar: r.avatar || '', type: r.type, color: r.color,
		reverseType: r.reverseType || r.type,
		reverseColor: r.reverseColor || r.color,
		asymmetric: r.asymmetric || false
	}
	showRelationModal.value = true
}

async function confirmRelation() {
	if (!relDraft.value.name.trim()) {
		uni.showToast({ title: tt('请输入角色名'), icon: 'none' })
		return
	}
	if (!selectedOCId.value) {
		uni.showToast({ title: tt('请先选择角色'), icon: 'none' })
		return
	}

	const payload = {
		ocId: selectedOCId.value,
		name: relDraft.value.name.trim(),
		emoji: relDraft.value.emoji,
		avatar: relDraft.value.avatar || '',
		type: relDraft.value.type,
		color: relDraft.value.color,
		reverseType: relDraft.value.asymmetric ? relDraft.value.reverseType : relDraft.value.type,
		reverseColor: relDraft.value.asymmetric ? relDraft.value.reverseColor : relDraft.value.color,
		asymmetric: !!relDraft.value.asymmetric
	}

	try {
		const res = editingRelId.value
			? await updateRelation(editingRelId.value, payload)
			: await createRelation(payload)
		upsertRelation(normalizeRelation(res.data || res))
		refreshCurrentRelations()
		syncLocalMirror()
		showRelationModal.value = false
		uni.showToast({ title: editingRelId.value ? tt('关系已更新') : tt('关系已添加'), icon: 'success' })
	} catch (error) {
		uni.showToast({ title: error.message || tt('关系保存失败'), icon: 'none' })
	}
}

function chooseRelAvatar() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			const tempPath = res.tempFilePaths[0]
			relDraft.value.avatar = tempPath
			try {
				const result = await uploadMedia({
					filePath: tempPath,
					bizType: 'oc_avatar',
					bizId: selectedOCId.value,
					fileType: 'image'
				})
				relDraft.value.avatar = result.path || result.url || tempPath
			} catch (e) {
				uni.showToast({ title: tt('头像上传失败，请重试'), icon: 'none' })
				relDraft.value.avatar = ''
			}
		}
	})
}

function removeRelation(idx) {
	const relation = relations.value[idx]
	if (!relation) return
	uni.showModal({
		title: tt('删除确认'),
		content: formatI18nText('确定删除与「{name}」的关系？', { name: relation.name }),
		success: async (res) => {
			if (!res.confirm) return
			try {
				await deleteRelation(relation.id)
				allRelations.value = allRelations.value.filter(item => item.id !== relation.id)
				refreshCurrentRelations()
				syncLocalMirror()
				uni.showToast({ title: tt('关系已删除'), icon: 'success' })
			} catch (error) {
				uni.showToast({ title: error.message || tt('删除关系失败'), icon: 'none' })
			}
		}
	})
}

// 新建 OC
function openNewOC() {
	newOCDraft.value = createEmptyNewOCDraft()
	showNewOC.value = true
}

async function confirmNewOC() {
	const name = newOCDraft.value.name.trim()
	if (!name) {
		uni.showToast({ title: tt('请输入角色名称'), icon: 'none' })
		return
	}

	try {
		const res = await createOC(buildNewOCPayload())
		const newOC = normalizeOC(res.data || res)
		upsertOC(newOC)
		selectedOCId.value = newOC.id
		await selectOC(newOC.id)
		showNewOC.value = false
		syncLocalMirror()
		uni.showToast({ title: formatI18nText('{name} 已诞生！✨', { name }), icon: 'none' })
		uni.$emit('refreshIndex')
	} catch (error) {
		uni.showToast({ title: error.message || tt('创建角色失败'), icon: 'none' })
	}
}

// 删除 OC
function confirmDeleteOC(oc) {
	if (!oc) return
	uni.showModal({
		title: tt('删除角色'),
		content: formatI18nText('确定永久删除「{name}」？此操作不可撤销。', { name: oc.name }),
		confirmColor: '#ef4444',
		success: async (res) => {
			if (!res.confirm) return
			try {
				await deleteOCById(oc.id)
				deleteLocalOC(oc.id)
				ocList.value = ocList.value.filter(item => item.id !== oc.id)
				allRelations.value = allRelations.value.filter(item => Number(item.ocId) !== Number(oc.id))
				if (ocList.value.length > 0) {
					await selectOC(ocList.value[0].id)
				} else {
					selectedOCId.value = null
					charData.value = createEmptyCharData()
					relations.value = []
				}
				syncLocalMirror()
				uni.showToast({ title: tt('角色已删除'), icon: 'none' })
				uni.$emit('refreshIndex')
			} catch (error) {
				uni.showToast({ title: error.message || tt('删除角色失败'), icon: 'none' })
			}
		}
	})
}

// 保存
async function saveSetting() {
	if (!selectedOCId.value) return
	try {
		const [ocRes, worldRes] = await Promise.all([
			updateOC(selectedOCId.value, buildCurrentOCPayload()),
			saveWorld({
				name: worldData.value.name || '',
				desc: worldData.value.desc || '',
				powerSystem: worldData.value.powerSystem || ''
			})
		])

		upsertOC(normalizeOC(ocRes.data || ocRes))
		worldData.value = normalizeWorld(worldRes.data || worldRes)
		syncLocalMirror()

		uni.showToast({ title: tt('设定已保存 ✨'), icon: 'none' })
		uni.$emit('refreshIndex')
		uni.$emit('refreshChat')
	} catch (error) {
		uni.showToast({ title: error.message || tt('保存失败'), icon: 'none' })
	}
}

// ---------- 导入 / 导出 ----------
const showExportModal = ref(false)
const showImportModal = ref(false)
const showImportInput = ref(false)
const importJsonText = ref('')

function doExportJSON() {
	const data = buildSingleExportData()
	if (!data) {
		uni.showToast({ title: tt('导出失败：未找到角色'), icon: 'none' })
		return
	}
	const json = JSON.stringify(data, null, 2)
	uni.setClipboardData({
		data: json,
		success: () => {
			showExportModal.value = false
			uni.showToast({ title: tt('已复制到剪贴板'), icon: 'success' })
		}
	})
}

function doExportAll() {
	const data = buildAllExportData()
	const json = JSON.stringify(data, null, 2)
	uni.setClipboardData({
		data: json,
		success: () => {
			showExportModal.value = false
			uni.showToast({ title: formatI18nText('已备份 {count} 个角色', { count: data.ocList.length }), icon: 'success' })
		}
	})
}

function doExportImage() {
	showExportModal.value = false
	uni.showLoading({ title: tt('生成中...') })
	const oc = buildExportOC()
	if (!oc) { uni.hideLoading(); return }

	nextTick(() => {
		const ctx = uni.createCanvasContext('ocCardCanvas')
		const W = 375, H = 560

		// 解析渐变色
		const gradientMatch = (oc.gradient || '').match(/#[0-9a-fA-F]{6}/g) || ['#667eea', '#764ba2']
		const grd = ctx.createLinearGradient(0, 0, W, H)
		grd.addColorStop(0, gradientMatch[0])
		grd.addColorStop(1, gradientMatch[1] || gradientMatch[0])
		ctx.setFillStyle(grd)
		ctx.fillRect(0, 0, W, H)

		// 半透明遮罩
		ctx.setFillStyle('rgba(255,255,255,0.15)')
		ctx.fillRect(0, 0, W, H)

		// 装饰圆
		ctx.setFillStyle('rgba(255,255,255,0.08)')
		ctx.beginPath(); ctx.arc(50, 80, 120, 0, Math.PI * 2); ctx.fill()
		ctx.beginPath(); ctx.arc(330, 450, 90, 0, Math.PI * 2); ctx.fill()

		// 表情
		ctx.setFontSize(60)
		ctx.setTextAlign('center')
		ctx.fillText(oc.emoji, W / 2, 100)

		// 名称
		ctx.setFillStyle('#ffffff')
		ctx.setFontSize(28)
		ctx.setTextAlign('center')
		ctx.fillText(oc.name || tt('未命名角色'), W / 2, 150)

		// 称号
		ctx.setFillStyle('rgba(255,255,255,0.75)')
		ctx.setFontSize(14)
		ctx.fillText(oc.title || '', W / 2, 175)

		// 分隔线
		ctx.setStrokeStyle('rgba(255,255,255,0.3)')
		ctx.setLineWidth(1)
		ctx.beginPath(); ctx.moveTo(40, 195); ctx.lineTo(W - 40, 195); ctx.stroke()

		// 属性条
		const stats = oc.stats || {}
		const barY = 215
		const barLabels = [tt('亲密度'), tt('战斗力'), tt('情感值')]
		const barValues = [stats.intimacy || 0, stats.combat || 0, stats.emotion || 0]
		barLabels.forEach((label, i) => {
			const y = barY + i * 36
			ctx.setFillStyle('rgba(255,255,255,0.8)')
			ctx.setFontSize(12)
			ctx.setTextAlign('left')
			ctx.fillText(label, 40, y)
			// 背景条
			ctx.setFillStyle('rgba(255,255,255,0.2)')
			const bx = 110, bw = W - 150, bh = 12
			ctx.fillRect(bx, y - 10, bw, bh)
			// 值条
			ctx.setFillStyle('rgba(255,255,255,0.85)')
			ctx.fillRect(bx, y - 10, bw * barValues[i] / 100, bh)
		})

		// 故事
		ctx.setFillStyle('rgba(255,255,255,0.85)')
		ctx.setFontSize(13)
		ctx.setTextAlign('left')
		const storyText = (oc.story || tt('暂无背景故事...')).slice(0, 120) + ((oc.story || '').length > 120 ? '...' : '')
		const storyLines = wrapText(ctx, storyText, W - 80)
		storyLines.forEach((line, i) => {
			if (i < 6) ctx.fillText(line, 40, 340 + i * 22)
		})

		// 标签
		const tags = (oc.tags || []).slice(0, 5)
		if (tags.length > 0) {
			let tx = 40
			const ty = 480
			ctx.setFontSize(11)
			tags.forEach(tag => {
				const tw = ctx.measureText('#' + tag).width + 16
				ctx.setFillStyle('rgba(255,255,255,0.2)')
				roundRect(ctx, tx, ty - 12, tw, 22, 11)
				ctx.fill()
				ctx.setFillStyle('rgba(255,255,255,0.9)')
				ctx.fillText('#' + tag, tx + 8, ty + 2)
				tx += tw + 8
			})
		}

		// 底部水印
		ctx.setFillStyle('rgba(255,255,255,0.4)')
		ctx.setFontSize(11)
		ctx.setTextAlign('center')
		ctx.fillText(tt('我的次元 · MyOCUniverse'), W / 2, H - 20)

		ctx.draw(false, () => {
			setTimeout(() => {
				uni.canvasToTempFilePath({
					canvasId: 'ocCardCanvas',
					width: W,
					height: H,
					destWidth: W * 2,
					destHeight: H * 2,
					success: (res) => {
						uni.hideLoading()
						uni.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success: () => uni.showToast({ title: tt('已保存到相册'), icon: 'success' }),
							fail: () => {
								uni.showToast({ title: tt('保存失败，请授权相册权限'), icon: 'none' })
							}
						})
					},
					fail: () => {
						uni.hideLoading()
						uni.showToast({ title: tt('图片生成失败'), icon: 'none' })
					}
				})
			}, 300)
		})
	})
}

function wrapText(ctx, text, maxWidth) {
	const lines = []
	let current = ''
	for (let i = 0; i < text.length; i++) {
		const ch = text[i]
		if (ch === '\n') { lines.push(current); current = ''; continue }
		const test = current + ch
		if (ctx.measureText(test).width > maxWidth) {
			lines.push(current)
			current = ch
		} else {
			current = test
		}
	}
	if (current) lines.push(current)
	return lines
}

function roundRect(ctx, x, y, w, h, r) {
	ctx.beginPath()
	ctx.moveTo(x + r, y)
	ctx.arcTo(x + w, y, x + w, y + h, r)
	ctx.arcTo(x + w, y + h, x, y + h, r)
	ctx.arcTo(x, y + h, x, y, r)
	ctx.arcTo(x, y, x + w, y, r)
	ctx.closePath()
}

function doImportFromClipboard() {
	showImportModal.value = false
	uni.getClipboardData({
		success: (res) => {
			processImportJSON(res.data)
		},
		fail: () => {
			uni.showToast({ title: tt('读取剪贴板失败'), icon: 'none' })
		}
	})
}

function doImportFromInput() {
	showImportModal.value = false
	importJsonText.value = ''
	showImportInput.value = true
}

function doImportFromText() {
	processImportJSON(importJsonText.value)
	showImportInput.value = false
}

function processImportJSON(text) {
	if (!text || !text.trim()) {
		uni.showToast({ title: tt('没有数据可导入'), icon: 'none' })
		return
	}
	let data
	try {
		data = JSON.parse(text.trim())
	} catch (e) {
		uni.showToast({ title: tt('数据格式错误，非有效 JSON'), icon: 'none' })
		return
	}
	importDataToServer(data)
}

async function importDataToServer(data) {
	try {
		let result
		if (data.type === 'all' && Array.isArray(data.ocList)) {
			result = await importAllPayload(data)
		} else if (data.oc) {
			result = await importSinglePayload(data)
		} else {
			uni.showToast({ title: tt('无法识别的数据格式'), icon: 'none' })
			return
		}

		await loadData()
		if (result.importedOC) {
			await selectOC(result.importedOC.id)
		}
		uni.showToast({ title: tt(result.msg), icon: 'success' })
		uni.$emit('refreshIndex')
	} catch (error) {
		uni.showToast({ title: error.message || tt('导入失败'), icon: 'none' })
	}
}

function createEmptyCharData() {
	return {
		name: '',
		title: '',
		emoji: '🌙',
		avatar: '',
		story: '',
		tags: [],
		voiceLines: [],
		height: '',
		weight: '',
		personality: [],
		alignment: '',
		skills: [],
		weaknesses: [],
		catchphrases: [],
		timeline: [],
		themeIdx: 0,
		stats: { intimacy: 0, combat: 0, emotion: 0 },
		level: 1,
		images: [],
		audios: [],
		videos: []
	}
}

function createEmptyWorldData() {
	return { name: '', desc: '', powerSystem: '' }
}

function createEmptyRelationDraft() {
	return {
		name: '',
		emoji: '🌸',
		avatar: '',
		type: '挚友',
		color: '#f472b6',
		reverseType: '挚友',
		reverseColor: '#f472b6',
		asymmetric: false
	}
}

function createEmptyNewOCDraft() {
	return { name: '', title: '', emoji: '🌙', themeIdx: 0 }
}

function normalizeOC(oc = {}) {
	return {
		id: oc.id,
		name: oc.name || '',
		title: oc.title || '',
		level: Number(oc.level || 1),
		emoji: oc.emoji || '🌙',
		avatar: oc.avatar || '',
		gradient: oc.gradient || ocThemes.value[0].gradient,
		barColor: oc.barColor || oc.bar_color || ocThemes.value[0].barColor,
		story: oc.story || '',
		tags: Array.isArray(oc.tags) ? oc.tags : [],
		voiceLines: Array.isArray(oc.voiceLines) ? oc.voiceLines : [],
		height: oc.height || '',
		weight: oc.weight || '',
		personality: Array.isArray(oc.personality) ? oc.personality : [],
		alignment: oc.alignment || '',
		skills: Array.isArray(oc.skills) ? oc.skills.map(skill => ({ ...skill })) : [],
		weaknesses: Array.isArray(oc.weaknesses) ? oc.weaknesses : [],
		catchphrases: Array.isArray(oc.catchphrases) ? oc.catchphrases : [],
		timeline: Array.isArray(oc.timeline) ? oc.timeline.map(item => ({ ...item })) : [],
		stats: normalizeStats(oc.stats),
		images: Array.isArray(oc.images) ? oc.images.map(item => ({ ...item })) : [],
		audios: Array.isArray(oc.audios) ? oc.audios.map(item => ({ ...item })) : [],
		videos: Array.isArray(oc.videos) ? oc.videos.map(item => ({ ...item })) : [],
		created_at: oc.created_at,
		updated_at: oc.updated_at
	}
}

function normalizeWorld(world = {}) {
	return {
		name: world.name || '',
		desc: world.desc || '',
		powerSystem: world.powerSystem || world.power_system || ''
	}
}

function normalizeRelation(relation = {}) {
	return {
		id: relation.id,
		ocId: Number(relation.ocId || relation.oc_id || selectedOCId.value || 0),
		name: relation.name || '',
		emoji: relation.emoji || '🌸',
		avatar: relation.avatar || '',
		type: relation.type || '挚友',
		color: relation.color || '#f472b6',
		reverseType: relation.reverseType || relation.reverse_type || relation.type || '挚友',
		reverseColor: relation.reverseColor || relation.reverse_color || relation.color || '#f472b6',
		asymmetric: !!relation.asymmetric
	}
}

function normalizeStats(stats = {}) {
	return {
		intimacy: Number(stats.intimacy || 0),
		combat: Number(stats.combat || 0),
		emotion: Number(stats.emotion || 0)
	}
}

function syncLocalMirror() {
	saveOCList(ocList.value)
	saveWorldData(worldData.value)
	saveRelations(allRelations.value)
}

function refreshCurrentRelations() {
	relations.value = allRelations.value.filter(item => Number(item.ocId) === Number(selectedOCId.value))
}

function upsertOC(oc) {
	const idx = ocList.value.findIndex(item => item.id === oc.id)
	if (idx >= 0) ocList.value[idx] = oc
	else ocList.value.push(oc)
}

function upsertRelation(relation) {
	const idx = allRelations.value.findIndex(item => item.id === relation.id)
	if (idx >= 0) allRelations.value[idx] = relation
	else allRelations.value.push(relation)
}

function buildCurrentOCPayload() {
	const current = ocList.value.find(item => item.id === selectedOCId.value) || {}
	const theme = ocThemes.value[charData.value.themeIdx] || ocThemes.value[0]

	return {
		name: charData.value.name.trim() || current.name || tt('未命名角色'),
		title: (charData.value.title || '').trim(),
		emoji: charData.value.emoji || '🌙',
		avatar: charData.value.avatar || '',
		gradient: theme.gradient,
		barColor: theme.barColor,
		story: charData.value.story || '',
		tags: [...new Set((charData.value.tags || []).map(item => item.trim()).filter(Boolean))],
		voiceLines: (charData.value.voiceLines || []).map(item => item.trim()).filter(Boolean),
		height: charData.value.height || '',
		weight: charData.value.weight || '',
		personality: [...new Set((charData.value.personality || []).map(item => item.trim()).filter(Boolean))],
		alignment: charData.value.alignment || '',
		skills: (charData.value.skills || [])
			.filter(item => (item.name || '').trim())
			.map(item => ({ name: item.name.trim(), level: Number(item.level || 1) })),
		weaknesses: [...new Set((charData.value.weaknesses || []).map(item => item.trim()).filter(Boolean))],
		catchphrases: (charData.value.catchphrases || []).map(item => item.trim()).filter(Boolean),
		timeline: (charData.value.timeline || [])
			.filter(item => (item.time || '').trim() || (item.event || '').trim())
			.map(item => ({ time: (item.time || '').trim(), event: (item.event || '').trim() })),
		level: Number(current.level || charData.value.level || 1),
		stats: normalizeStats(current.stats || charData.value.stats),
		images: (charData.value.images || []).map(item => ({ ...item })),
		audios: (charData.value.audios || []).map(item => ({ ...item })),
		videos: (charData.value.videos || []).map(item => ({ ...item }))
	}
}

function buildNewOCPayload() {
	const theme = ocThemes.value[newOCDraft.value.themeIdx] || ocThemes.value[0]
	return {
		name: newOCDraft.value.name.trim(),
		title: newOCDraft.value.title.trim() || tt('未知称号'),
		emoji: newOCDraft.value.emoji || '🌙',
		avatar: '',
		gradient: theme.gradient,
		barColor: theme.barColor,
		story: '',
		tags: [],
		voiceLines: ['你好...初次见面。'],
		height: '',
		weight: '',
		personality: [],
		alignment: '',
		skills: [],
		weaknesses: [],
		catchphrases: [],
		timeline: [],
		level: 1,
		stats: { intimacy: 0, combat: 0, emotion: 0 }
	}
}

function buildSingleExportData() {
	const oc = buildExportOC()
	if (!oc) return null

	return {
		version: '1.0',
		app: '我的次元',
		exportTime: new Date().toISOString(),
		type: 'single',
		oc,
		world: { ...worldData.value },
		relations: allRelations.value.filter(item => Number(item.ocId) === Number(selectedOCId.value)),
		chatMessages: getChatMessages(selectedOCId.value)
	}
}

function buildAllExportData() {
	const mergedList = ocList.value.map(item => (
		item.id === selectedOCId.value ? buildExportOC() : item
	)).filter(Boolean)
	const chatMessages = {}
	mergedList.forEach(oc => {
		const messages = getChatMessages(oc.id)
		if (messages.length > 0) chatMessages[oc.id] = messages
	})

	return {
		version: '1.0',
		app: '我的次元',
		exportTime: new Date().toISOString(),
		type: 'all',
		ocList: mergedList,
		world: { ...worldData.value },
		relations: allRelations.value.map(item => ({ ...item })),
		chatMessages
	}
}

function buildExportOC() {
	if (!selectedOCId.value) return null
	const current = ocList.value.find(item => item.id === selectedOCId.value)
	if (!current) return null
	return {
		...current,
		...buildCurrentOCPayload(),
		id: current.id
	}
}

async function importSinglePayload(payload) {
	const created = await createOC(normalizeImportedOC(payload.oc))
	const importedOC = normalizeOC(created.data || created)

	if (Array.isArray(payload.chatMessages) && payload.chatMessages.length > 0) {
		saveChatMessages(importedOC.id, payload.chatMessages)
	}

	const relationList = Array.isArray(payload.relations) ? payload.relations : []
	for (const relation of relationList) {
		await createRelation(normalizeImportedRelation(relation, importedOC.id))
	}

	await maybeImportWorld(payload.world)
	return { importedOC, msg: formatI18nText('「{name}」导入成功！', { name: importedOC.name }) }
}

async function importAllPayload(payload) {
	const relationOwnerMap = {}
	const items = Array.isArray(payload.ocList) ? payload.ocList : []
	let count = 0

	for (const oc of items) {
		const created = await createOC(normalizeImportedOC(oc))
		const importedOC = normalizeOC(created.data || created)
		relationOwnerMap[oc.id] = importedOC.id
		if (payload.chatMessages && Array.isArray(payload.chatMessages[oc.id])) {
			saveChatMessages(importedOC.id, payload.chatMessages[oc.id])
		}
		count += 1
	}

	const relationList = Array.isArray(payload.relations) ? payload.relations : []
	const firstImportedOcId = Object.values(relationOwnerMap)[0]
	for (const relation of relationList) {
		const mappedOcId = relationOwnerMap[relation.ocId] || relationOwnerMap[relation.oc_id] || firstImportedOcId
		if (!mappedOcId) continue
		await createRelation(normalizeImportedRelation(relation, mappedOcId))
	}

	await maybeImportWorld(payload.world)
	return { msg: formatI18nText('成功导入 {count} 个角色！', { count }) }
}

function normalizeImportedOC(oc = {}) {
	const themeIdx = ocThemes.value.findIndex(item => item.gradient === oc.gradient)
	const theme = ocThemes.value[themeIdx >= 0 ? themeIdx : 0]

	return {
		name: (oc.name || '').trim() || tt('未命名角色'),
		title: (oc.title || '').trim(),
		emoji: oc.emoji || '🌙',
		avatar: oc.avatar || '',
		gradient: oc.gradient || theme.gradient,
		barColor: oc.barColor || oc.bar_color || theme.barColor,
		story: oc.story || '',
		tags: Array.isArray(oc.tags) ? oc.tags.filter(Boolean) : [],
		voiceLines: Array.isArray(oc.voiceLines) ? oc.voiceLines.filter(Boolean) : [],
		height: oc.height || '',
		weight: oc.weight || '',
		personality: Array.isArray(oc.personality) ? oc.personality.filter(Boolean) : [],
		alignment: oc.alignment || '',
		skills: Array.isArray(oc.skills)
			? oc.skills.filter(item => item && item.name).map(item => ({ name: item.name, level: Number(item.level || 1) }))
			: [],
		weaknesses: Array.isArray(oc.weaknesses) ? oc.weaknesses.filter(Boolean) : [],
		catchphrases: Array.isArray(oc.catchphrases) ? oc.catchphrases.filter(Boolean) : [],
		timeline: Array.isArray(oc.timeline)
			? oc.timeline.map(item => ({ time: item.time || '', event: item.event || '' }))
			: [],
		level: Number(oc.level || 1),
		stats: normalizeStats(oc.stats),
		images: Array.isArray(oc.images) ? oc.images.map(item => ({ ...item })) : [],
		audios: Array.isArray(oc.audios) ? oc.audios.map(item => ({ ...item })) : [],
		videos: Array.isArray(oc.videos) ? oc.videos.map(item => ({ ...item })) : []
	}
}

function normalizeImportedRelation(relation = {}, fallbackOcId) {
	return {
		ocId: Number(relation.ocId || relation.oc_id || fallbackOcId),
		name: (relation.name || '').trim() || tt('未命名关系'),
		emoji: relation.emoji || '🌸',
		avatar: relation.avatar || '',
		type: relation.type || '挚友',
		color: relation.color || '#f472b6',
		reverseType: relation.reverseType || relation.reverse_type || relation.type || '挚友',
		reverseColor: relation.reverseColor || relation.reverse_color || relation.color || '#f472b6',
		asymmetric: !!relation.asymmetric
	}
}

async function maybeImportWorld(world) {
	if (!world || !isWorldEmpty(worldData.value) || !hasWorldContent(world)) return
	const res = await saveWorld({
		name: world.name || '',
		desc: world.desc || '',
		powerSystem: world.powerSystem || world.power_system || ''
	})
	worldData.value = normalizeWorld(res.data || res)
}

function hasWorldContent(world = {}) {
	return !!((world.name || '').trim() || (world.desc || '').trim() || (world.powerSystem || world.power_system || '').trim())
}

function isWorldEmpty(world = {}) {
	return !hasWorldContent(world)
}
</script>

<style scoped>
/* ========== 页面基础 ========== */
.page {
	min-height: 100vh;
	background: linear-gradient(160deg, #FFF0F5 0%, #EDE7F6 40%, #F0F4FF 70%, #FFF5F5 100%);
	overflow-x: hidden;
}

/* ========== 导航栏 ========== */
.nav-bar {
	position: relative;
	text-align: center;
	padding-bottom: 24rpx;
	background: rgba(255,255,255,0.55);
	backdrop-filter: blur(24px) saturate(1.6);
	border-bottom: 1rpx solid rgba(255,255,255,0.6);
	box-shadow: 0 4rpx 20rpx rgba(167,139,250,0.06);
}
.nav-lang { position: absolute; right: 32rpx; bottom: 18rpx; }
.nav-title {
	font-size: 40rpx;
	font-weight: 800;
	background: linear-gradient(135deg, #b06afc, #f472b6, #a78bfa);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin-top: 20rpx;
	display: block;
	letter-spacing: 6rpx;
}

/* ========== OC 选择器 ========== */
.oc-selector { padding: 20rpx 30rpx 16rpx; }
.oc-scroll { white-space: nowrap; }
.oc-chip {
	display: inline-flex;
	align-items: center;
	padding: 14rpx 28rpx;
	margin-right: 16rpx;
	background: rgba(255,255,255,0.72);
	backdrop-filter: blur(16px) saturate(1.3);
	border-radius: 40rpx;
	border: 2rpx solid rgba(255,255,255,0.9);
	box-shadow: 0 4rpx 16rpx rgba(167,139,250,0.06);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.oc-chip.active {
	background: linear-gradient(135deg, rgba(192,132,252,0.14), rgba(249,168,212,0.12));
	border-color: rgba(192,132,252,0.35);
	box-shadow: 0 6rpx 24rpx rgba(192,132,252,0.2);
}
.chip-emoji { font-size: 30rpx; margin-right: 10rpx; }
.chip-name { font-size: 26rpx; color: #6b7280; font-weight: 600; }
.oc-chip.active .chip-name { color: #b06afc; }

/* ========== Tab 栏 ========== */
.tab-bar {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin: 8rpx 30rpx 0;
	background: rgba(255,255,255,0.65);
	backdrop-filter: blur(24px) saturate(1.4);
	border-radius: 28rpx;
	padding: 10rpx;
	border: 2rpx solid rgba(255,255,255,0.85);
	box-shadow: 0 4rpx 20rpx rgba(167,139,250,0.05);
}
.tab-item {
	width: calc(25% - 8rpx);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 14rpx 0 12rpx;
	border-radius: 22rpx;
	z-index: 2;
	transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	box-sizing: border-box;
}
.tab-item.active {
	background: linear-gradient(135deg, rgba(176,106,252,0.12), rgba(244,114,182,0.1));
	box-shadow: 0 4rpx 20rpx rgba(176,106,252,0.15);
}
.tab-icon { font-size: 28rpx; margin-bottom: 2rpx; }
.tab-text { font-size: 21rpx; font-weight: 600; color: #9ca3af; transition: color 0.3s; }
.tab-item.active .tab-text { color: #b06afc; font-weight: 700; }
.tab-item-manage {
	background: rgba(107,114,128,0.06);
	border: 1rpx dashed rgba(107,114,128,0.2);
}
.tab-item-manage .tab-text { color: #6b7280; }
.tab-item-manage:active {
	background: rgba(107,114,128,0.12);
}

/* ========== 编辑区域 ========== */
.editor-scroll { height: calc(100vh - 280rpx); }
.editor-section { padding: 28rpx 30rpx; }
.section-header {
	display: flex;
	align-items: center;
	margin-bottom: 32rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid rgba(167,139,250,0.1);
}
.section-icon {
	font-size: 40rpx;
	margin-right: 14rpx;
	filter: drop-shadow(0 2rpx 6rpx rgba(167,139,250,0.25));
}
.section-title {
	font-size: 34rpx;
	font-weight: 800;
	color: #374151;
	letter-spacing: 2rpx;
}

/* ========== 输入组 ========== */
.input-group { margin-bottom: 32rpx; }
.input-label {
	font-size: 26rpx;
	font-weight: 700;
	color: #6b7280;
	margin-bottom: 14rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
}
.input-label::before {
	content: '';
	display: inline-block;
	width: 6rpx;
	height: 24rpx;
	border-radius: 3rpx;
	background: linear-gradient(180deg, #b06afc, #f472b6);
	flex-shrink: 0;
}
.glass-input {
	background: rgba(255,255,255,0.75);
	backdrop-filter: blur(20px) saturate(1.2);
	border: 2rpx solid rgba(167,139,250,0.08);
	border-radius: 24rpx;
	padding: 22rpx 28rpx;
	transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 2rpx 12rpx rgba(167,139,250,0.04), inset 0 1rpx 2rpx rgba(255,255,255,0.8);
}
.glass-input:focus-within {
	border-color: rgba(176,106,252,0.35);
	box-shadow: 0 0 0 6rpx rgba(176,106,252,0.07), 0 6rpx 20rpx rgba(176,106,252,0.1);
	transform: translateY(-2rpx);
	background: rgba(255,255,255,0.88);
}
.glass-input input { font-size: 28rpx; color: #374151; }
.glass-textarea {
	background: rgba(255,255,255,0.75);
	backdrop-filter: blur(16px);
	border: 2rpx solid rgba(167,139,250,0.08);
	border-radius: 20rpx;
	padding: 22rpx 24rpx;
	display: flex;
	transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	box-sizing: border-box;
	width: 100%;
	box-shadow: 0 2rpx 12rpx rgba(167,139,250,0.04), inset 0 1rpx 2rpx rgba(255,255,255,0.8);
}
.glass-textarea:focus-within {
	border-color: rgba(176,106,252,0.35);
	box-shadow: 0 0 0 5rpx rgba(176,106,252,0.07), 0 6rpx 20rpx rgba(176,106,252,0.1);
	background: rgba(255,255,255,0.88);
}
.line-numbers {
	width: 48rpx;
	flex-shrink: 0;
	border-right: 2rpx solid rgba(167,139,250,0.12);
	margin-right: 16rpx;
	padding-right: 8rpx;
}
.line-num {
	display: block;
	font-size: 22rpx;
	color: rgba(167,139,250,0.3);
	line-height: 42rpx;
	text-align: right;
}
.glass-textarea textarea {
	flex: 1;
	font-size: 28rpx;
	color: #374151;
	line-height: 42rpx;
	min-height: 200rpx;
	width: 0;
}
.placeholder { color: #d1d5db; }

/* ========== 头像上传 ========== */
.avatar-upload-area { display: flex; align-items: center; gap: 32rpx; }
.avatar-preview {
	position: relative;
	width: 150rpx;
	height: 150rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(255,182,193,0.25), rgba(167,139,250,0.25));
	display: flex;
	align-items: center;
	justify-content: center;
	border: 3rpx solid rgba(167,139,250,0.25);
	flex-shrink: 0;
	box-shadow: 0 8rpx 28rpx rgba(167,139,250,0.1);
	transition: all 0.3s;
}
.avatar-preview:active { transform: scale(0.95); }
.avatar-img { width: 150rpx; height: 150rpx; border-radius: 50%; }
.avatar-emoji-large { font-size: 68rpx; }
.avatar-camera {
	position: absolute;
	bottom: 2rpx;
	right: 2rpx;
	width: 46rpx;
	height: 46rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #f472b6, #a78bfa);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 3rpx solid #fff;
	box-shadow: 0 4rpx 12rpx rgba(167,139,250,0.3);
}
.camera-icon { font-size: 22rpx; }
.avatar-actions { display: flex; flex-direction: column; gap: 12rpx; }
.avatar-hint { font-size: 24rpx; color: #9ca3af; }
.avatar-clear { font-size: 24rpx; color: #ef4444; font-weight: 500; }

/* ========== 表情选择 ========== */
.emoji-picker { display: flex; flex-wrap: wrap; gap: 14rpx; }
.emoji-picker.small { gap: 10rpx; }
.emoji-option {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255,255,255,0.7);
	border-radius: 22rpx;
	border: 2rpx solid rgba(167,139,250,0.06);
	font-size: 38rpx;
	transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.emoji-option.active {
	background: rgba(176,106,252,0.12);
	border-color: rgba(176,106,252,0.35);
	box-shadow: 0 4rpx 20rpx rgba(176,106,252,0.2);
	transform: scale(1.1);
}

/* ========== 标签区 ========== */
.tags-area {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	background: rgba(255,255,255,0.55);
	backdrop-filter: blur(20px) saturate(1.2);
	border-radius: 20rpx;
	padding: 22rpx;
	border: 2rpx solid rgba(167,139,250,0.06);
	min-height: 80rpx;
}
.tag-item {
	display: flex;
	align-items: center;
	background: linear-gradient(135deg, rgba(176,106,252,0.1), rgba(176,106,252,0.06));
	border-radius: 24rpx;
	padding: 10rpx 22rpx;
	border: 1rpx solid rgba(176,106,252,0.12);
	transition: all 0.2s;
}
.tag-text { font-size: 24rpx; color: #9366e8; font-weight: 500; }
.tag-remove { font-size: 28rpx; color: #c4b5fd; margin-left: 10rpx; }
.tag-add {
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: rgba(176,106,252,0.06);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx dashed rgba(176,106,252,0.25);
	transition: all 0.2s;
}
.tag-add:active { background: rgba(176,106,252,0.12); }
.tag-add-icon { font-size: 32rpx; color: #a78bfa; }
.tag-input-wrap { flex: 1; min-width: 120rpx; }
.tag-input-wrap input { font-size: 24rpx; color: #9366e8; }

/* ========== 语音台词 & 添加按钮 ========== */
.voice-list {
	background: rgba(255,255,255,0.55);
	border-radius: 20rpx;
	padding: 20rpx;
	border: 2rpx solid rgba(167,139,250,0.06);
}
.voice-item {
	display: flex;
	align-items: center;
	margin-bottom: 14rpx;
	gap: 10rpx;
}
.voice-num {
	font-size: 24rpx;
	color: #b06afc;
	width: 44rpx;
	font-weight: 700;
}
.voice-input {
	flex: 1;
	font-size: 26rpx;
	color: #374151;
	background: rgba(255,255,255,0.7);
	border-radius: 16rpx;
	padding: 0 18rpx;
	height: 68rpx;
	line-height: 68rpx;
	border: 1rpx solid rgba(167,139,250,0.06);
	transition: border-color 0.3s;
}
.voice-input:focus { border-color: rgba(176,106,252,0.3); }
.voice-del { font-size: 32rpx; color: #d1d5db; width: 44rpx; text-align: center; }
.add-voice {
	text-align: center;
	padding: 18rpx;
	margin-top: 4rpx;
	border-radius: 14rpx;
	background: rgba(176,106,252,0.04);
	transition: background 0.2s;
}
.add-voice:active { background: rgba(176,106,252,0.1); }
.add-voice-text { font-size: 26rpx; color: #a78bfa; font-weight: 600; }

/* ========== 关系网 ========== */
.relation-graph { padding: 20rpx 0; }
.relation-center { display: flex; justify-content: center; margin-bottom: 40rpx; }
.relation-node {
	display: flex;
	flex-direction: column;
	align-items: center;
	background: rgba(255,255,255,0.85);
	backdrop-filter: blur(20px);
	border-radius: 24rpx;
	padding: 24rpx 36rpx;
	border: 2rpx solid rgba(167,139,250,0.2);
	box-shadow: 0 8rpx 28rpx rgba(0,0,0,0.05);
	transition: all 0.25s;
}
.relation-node:active { transform: scale(0.97); }
.main-node {
	border-color: rgba(176,106,252,0.4);
	box-shadow: 0 4rpx 20rpx rgba(176,106,252,0.15), 0 0 0 4rpx rgba(176,106,252,0.06);
}
.node-emoji { font-size: 42rpx; }
.node-avatar { width: 76rpx; height: 76rpx; border-radius: 50%; }
.node-name { font-size: 24rpx; color: #374151; font-weight: 700; margin-top: 10rpx; }
.relation-item {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	padding: 16rpx 30rpx;
	background: rgba(255,255,255,0.4);
	border-radius: 20rpx;
	margin-left: 10rpx;
	margin-right: 10rpx;
	transition: background 0.2s;
}
.relation-line {
	width: 48rpx;
	height: 4rpx;
	border-radius: 2rpx;
	margin-right: 16rpx;
	flex-shrink: 0;
}
.relation-labels { display: flex; flex-direction: column; gap: 8rpx; margin-left: 16rpx; flex: 1; }
.relation-label {
	padding: 8rpx 18rpx;
	border-radius: 14rpx;
	font-size: 22rpx;
	font-weight: 500;
	display: inline-block;
	align-self: flex-start;
}
.reverse-label { border: 1rpx dashed; border-color: inherit; }
.relation-del { font-size: 32rpx; color: #d1d5db; padding: 0 8rpx; flex-shrink: 0; }
.add-relation {
	text-align: center;
	padding: 28rpx;
	background: rgba(176,106,252,0.04);
	border-radius: 20rpx;
	margin: 8rpx 10rpx 0;
	border: 2rpx dashed rgba(176,106,252,0.2);
	transition: all 0.2s;
}
.add-relation:active { background: rgba(176,106,252,0.1); }
.add-icon { font-size: 28rpx; color: #a78bfa; font-weight: 600; }

/* ========== 不对称关系开关 ========== */
.asymmetric-toggle { display: flex; align-items: center; gap: 16rpx; padding: 10rpx 0; }
.toggle-track {
	width: 84rpx;
	height: 46rpx;
	border-radius: 23rpx;
	background: #e5e7eb;
	position: relative;
	transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	flex-shrink: 0;
}
.toggle-track.on { background: linear-gradient(135deg, #b06afc, #c084fc); }
.toggle-thumb {
	width: 38rpx;
	height: 38rpx;
	border-radius: 50%;
	background: #fff;
	position: absolute;
	top: 4rpx;
	left: 4rpx;
	transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
}
.toggle-track.on .toggle-thumb { transform: translateX(38rpx); }
.toggle-label { font-size: 26rpx; font-weight: 600; color: #374151; }
.toggle-hint { font-size: 22rpx; color: #9ca3af; }

/* ========== 不对称关系预览 ========== */
.asymmetric-preview {
	background: rgba(255,255,255,0.65);
	border-radius: 20rpx;
	padding: 24rpx;
	border: 2rpx solid rgba(167,139,250,0.08);
}
.preview-row { display: flex; align-items: center; gap: 12rpx; margin-bottom: 14rpx; }
.preview-row:last-child { margin-bottom: 0; }
.preview-oc-name { font-size: 24rpx; font-weight: 700; color: #374151; min-width: 60rpx; }
.preview-arrow { padding: 8rpx 18rpx; border-radius: 14rpx; }
.preview-arrow-text { font-size: 22rpx; font-weight: 600; }

/* ========== 关系弹窗 (兼容) ========== */

/* ========== 关系角色头像 ========== */
.rel-avatar-area { display: flex; align-items: center; gap: 24rpx; }
.rel-avatar-preview {
	position: relative;
	width: 104rpx;
	height: 104rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(255,182,193,0.25), rgba(167,139,250,0.25));
	display: flex;
	align-items: center;
	justify-content: center;
	border: 3rpx solid rgba(167,139,250,0.25);
	flex-shrink: 0;
	box-shadow: 0 6rpx 20rpx rgba(167,139,250,0.08);
}
.rel-avatar-img { width: 104rpx; height: 104rpx; border-radius: 50%; }
.rel-avatar-emoji { font-size: 48rpx; }
.rel-avatar-camera {
	position: absolute;
	bottom: -2rpx;
	right: -2rpx;
	width: 38rpx;
	height: 38rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #f472b6, #a78bfa);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #fff;
	box-shadow: 0 2rpx 8rpx rgba(167,139,250,0.3);
}
.rel-avatar-camera .camera-icon { font-size: 18rpx; }
.rel-avatar-actions { display: flex; flex-direction: column; gap: 8rpx; }

/* ========== 预览区 ========== */
.preview-section { padding: 8rpx 30rpx 30rpx; }
.preview-card {
	background: rgba(255,255,255,0.82);
	backdrop-filter: blur(24px) saturate(1.4);
	border-radius: 28rpx;
	overflow: hidden;
	border: 2rpx solid rgba(255,255,255,0.9);
	position: relative;
	box-shadow: 0 12rpx 48rpx rgba(0,0,0,0.06), 0 4rpx 16rpx rgba(167,139,250,0.06);
}
.preview-watermark {
	position: absolute;
	top: 0; left: 0;
	width: 200%; height: 200%;
	display: flex; flex-wrap: wrap;
	gap: 60rpx;
	transform: rotate(-25deg);
	transform-origin: center;
	opacity: 0.05;
	pointer-events: none;
}
.watermark-text { font-size: 28rpx; color: #a78bfa; font-weight: 700; white-space: nowrap; }
.preview-content { position: relative; padding: 36rpx; z-index: 2; }
.preview-header-row { display: flex; align-items: center; gap: 18rpx; margin-bottom: 20rpx; }
.preview-emoji { font-size: 52rpx; }
.preview-name { font-size: 36rpx; font-weight: 800; color: #374151; display: block; }
.preview-title { font-size: 24rpx; color: #b06afc; display: block; margin-top: 6rpx; font-weight: 500; }
.preview-story {
	font-size: 26rpx;
	color: #6b7280;
	line-height: 1.85;
	display: block;
	word-break: break-all;
	overflow-wrap: break-word;
}
.preview-tags { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 24rpx; }
.preview-tag {
	font-size: 22rpx;
	padding: 6rpx 18rpx;
	background: linear-gradient(135deg, rgba(176,106,252,0.08), rgba(244,114,182,0.08));
	border-radius: 14rpx;
	color: #9366e8;
	font-weight: 500;
}


/* ========== 底部抽屉式弹窗 ========== */
.sheet-mask {
	position: fixed;
	top: 0; left: 0;
	width: 100%; height: 100%;
	background: rgba(15,10,30,0.35);
	z-index: 999;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	animation: sheetMaskIn 0.2s ease-out;
}
@keyframes sheetMaskIn {
	from { opacity: 0; }
	to { opacity: 1; }
}
.sheet-card {
	width: 100%;
	max-height: 75vh;
	background: rgba(255,255,255,0.98);
	backdrop-filter: blur(40px) saturate(1.8);
	border-radius: 36rpx 36rpx 0 0;
	overflow: hidden;
	box-shadow: 0 -12rpx 48rpx rgba(0,0,0,0.1);
	padding-bottom: env(safe-area-inset-bottom);
	animation: sheetSlideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-card-tall { max-height: 85vh; }
@keyframes sheetSlideUp {
	from { transform: translateY(100%); }
	to { transform: translateY(0); }
}
.sheet-handle {
	width: 64rpx;
	height: 8rpx;
	border-radius: 4rpx;
	background: rgba(0,0,0,0.1);
	margin: 20rpx auto 0;
}
.sheet-title {
	font-size: 34rpx;
	font-weight: 800;
	color: #374151;
	display: block;
	text-align: center;
	padding: 24rpx 0 16rpx;
	letter-spacing: 1rpx;
}
.sheet-body { padding: 0 36rpx 20rpx; }
.sheet-scroll-body { max-height: 60vh; }
.sheet-options { padding: 8rpx 36rpx 16rpx; }
.sheet-option {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 24rpx 20rpx;
	margin-bottom: 14rpx;
	background: rgba(0,0,0,0.015);
	border-radius: 22rpx;
	transition: all 0.2s;
}
.sheet-option:active { background: rgba(176,106,252,0.08); transform: scale(0.98); }
.sheet-option:last-child { margin-bottom: 0; }
.sheet-option-icon-wrap {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
	flex-shrink: 0;
}
.sheet-option-icon { font-size: 38rpx; }
.sheet-option-info { display: flex; flex-direction: column; flex: 1; }
.sheet-option-name { font-size: 28rpx; font-weight: 700; color: #374151; display: block; }
.sheet-option-desc { font-size: 22rpx; color: #9ca3af; display: block; margin-top: 6rpx; }
.sheet-cancel {
	margin: 12rpx 36rpx 24rpx;
	text-align: center;
	padding: 24rpx 0;
	background: rgba(0,0,0,0.03);
	border-radius: 20rpx;
	transition: background 0.2s;
}
.sheet-cancel:active { background: rgba(0,0,0,0.06); }
.sheet-cancel-text { font-size: 28rpx; color: #9ca3af; font-weight: 600; }
.sheet-btn-row {
	display: flex;
	gap: 20rpx;
	padding: 16rpx 36rpx 24rpx;
}
.sheet-btn {
	flex: 1;
	text-align: center;
	padding: 24rpx 0;
	border-radius: 22rpx;
	font-size: 28rpx;
	transition: all 0.2s;
}
.sheet-btn:active { transform: scale(0.97); }
.sheet-btn-cancel {
	background: rgba(0,0,0,0.04);
}
.sheet-btn-cancel text { color: #9ca3af; font-weight: 600; }
.sheet-btn-confirm {
	background: linear-gradient(135deg, #b06afc, #c084fc);
	box-shadow: 0 6rpx 20rpx rgba(176,106,252,0.3);
}
.sheet-btn-confirm text { color: #fff; font-weight: 700; }

/* ========== 表单 (抽屉内复用) ========== */
.type-picker { display: flex; flex-wrap: wrap; gap: 14rpx; }
.type-chip {
	padding: 12rpx 26rpx;
	border-radius: 22rpx;
	font-size: 24rpx;
	color: #6b7280;
	background: rgba(0,0,0,0.025);
	border: 2rpx solid rgba(0,0,0,0.05);
	transition: all 0.25s;
}
.type-chip.active { font-weight: 700; }

/* ========== 新建/导入 OC 按钮 ========== */
.add-chip {
	background: rgba(176,106,252,0.06);
	border: 2rpx dashed rgba(176,106,252,0.3);
}
.add-chip .chip-emoji { color: #b06afc; font-size: 32rpx; margin-right: 4rpx; }
.add-chip .chip-name { color: #b06afc; }

/* ========== 空状态 ========== */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 160rpx 60rpx 120rpx;
	position: relative;
}
.empty-glow {
	position: absolute;
	top: 120rpx;
	width: 300rpx;
	height: 300rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(176,106,252,0.12) 0%, transparent 70%);
	pointer-events: none;
}
.empty-emoji {
	font-size: 108rpx;
	margin-bottom: 32rpx;
	animation: emptyFloat 3s ease-in-out infinite;
}
@keyframes emptyFloat {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-16rpx); }
}
.empty-title {
	font-size: 36rpx;
	font-weight: 800;
	color: #374151;
	margin-bottom: 16rpx;
}
.empty-desc {
	font-size: 26rpx;
	color: #9ca3af;
	text-align: center;
	line-height: 1.7;
	margin-bottom: 48rpx;
}
.empty-btn {
	background: linear-gradient(135deg, #b06afc, #f472b6);
	border-radius: 44rpx;
	padding: 26rpx 72rpx;
	box-shadow: 0 12rpx 36rpx rgba(176,106,252,0.35);
	transition: all 0.25s;
}
.empty-btn:active { transform: scale(0.95); }
.empty-btn-text { font-size: 30rpx; color: #fff; font-weight: 700; letter-spacing: 2rpx; }

/* (旧导入导出样式已迁移至 sheet-* 系列) */

/* ========== 配色选择器 ========== */
.theme-picker { display: flex; flex-wrap: wrap; gap: 16rpx; }
.theme-option {
	width: calc(33.33% - 12rpx);
	height: 84rpx;
	border-radius: 22rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 3rpx solid transparent;
	transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.theme-option.active {
	border-color: rgba(255,255,255,0.9);
	box-shadow: 0 0 0 6rpx rgba(176,106,252,0.35), 0 8rpx 24rpx rgba(0,0,0,0.18);
	transform: scale(1.04);
}
.theme-name {
	font-size: 22rpx;
	color: #fff;
	font-weight: 700;
	text-shadow: 0 2rpx 6rpx rgba(0,0,0,0.3);
}

/* ========== 身高体重双输入 ========== */
.double-input { display: flex; gap: 16rpx; }
.glass-input.half { flex: 1; }

/* ========== 性格预设 ========== */
.preset-row { display: flex; flex-wrap: wrap; gap: 14rpx; }
.preset-chip {
	padding: 12rpx 26rpx;
	border-radius: 22rpx;
	font-size: 24rpx;
	color: #6b7280;
	background: rgba(255,255,255,0.65);
	border: 2rpx solid rgba(0,0,0,0.04);
	transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.preset-chip.active {
	background: rgba(176,106,252,0.12);
	border-color: rgba(176,106,252,0.3);
	color: #b06afc;
	font-weight: 700;
	transform: scale(1.04);
	box-shadow: 0 4rpx 16rpx rgba(176,106,252,0.12);
}

/* ========== 阵营九宫格 ========== */
.alignment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14rpx; }
.alignment-cell {
	padding: 22rpx 8rpx;
	text-align: center;
	background: rgba(255,255,255,0.65);
	backdrop-filter: blur(12px) saturate(1.2);
	border-radius: 18rpx;
	border: 2rpx solid rgba(0,0,0,0.03);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.alignment-cell.active {
	background: rgba(176,106,252,0.12);
	border-color: rgba(176,106,252,0.35);
	box-shadow: 0 4rpx 20rpx rgba(176,106,252,0.15);
}
.alignment-text { font-size: 24rpx; color: #6b7280; }
.alignment-cell.active .alignment-text { color: #b06afc; font-weight: 700; }

/* ========== 技能树 ========== */
.skill-list {
	background: rgba(255,255,255,0.55);
	border-radius: 20rpx;
	padding: 20rpx;
	border: 2rpx solid rgba(167,139,250,0.06);
}
.skill-item {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
	gap: 12rpx;
}
.skill-name-input {
	flex: 1;
	font-size: 26rpx;
	color: #374151;
	background: rgba(255,255,255,0.7);
	border-radius: 16rpx;
	padding: 0 18rpx;
	height: 68rpx;
	line-height: 68rpx;
	border: 1rpx solid rgba(167,139,250,0.06);
}
.skill-stars { display: flex; gap: 6rpx; flex-shrink: 0; }
.star {
	font-size: 34rpx;
	color: #e5e7eb;
	transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.star.active { color: #f59e0b; transform: scale(1.1); }
.skill-del { font-size: 32rpx; color: #d1d5db; width: 44rpx; text-align: center; flex-shrink: 0; }

/* ========== 弱点标签 ========== */
.weakness-tag {
	background: linear-gradient(135deg, rgba(239,68,68,0.07), rgba(239,68,68,0.12)) !important;
	border-color: rgba(239,68,68,0.12) !important;
}
.weakness-tag .tag-text { color: #ef4444; }

/* ========== 时间线 ========== */
.timeline-list { padding-left: 8rpx; }
.timeline-item { display: flex; margin-bottom: 8rpx; }
.timeline-marker {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 44rpx;
	flex-shrink: 0;
	padding-top: 26rpx;
}
.timeline-dot {
	width: 22rpx;
	height: 22rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #b06afc, #c084fc);
	border: 4rpx solid rgba(176,106,252,0.15);
	flex-shrink: 0;
	box-shadow: 0 0 12rpx rgba(176,106,252,0.2);
}
.timeline-line {
	width: 3rpx;
	flex: 1;
	background: linear-gradient(180deg, rgba(176,106,252,0.25), rgba(176,106,252,0.08));
	margin-top: 8rpx;
}
.timeline-content {
	flex: 1;
	margin-left: 18rpx;
	position: relative;
	padding-bottom: 18rpx;
}
.timeline-content .timeline-time-input { margin-bottom: 14rpx; }
.timeline-content .timeline-event-input { min-height: 80rpx; }
.timeline-content .timeline-event-input textarea {
	font-size: 26rpx;
	color: #374151;
	line-height: 42rpx;
	min-height: 80rpx;
	width: 100%;
}
.timeline-del {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	font-size: 32rpx;
	color: #d1d5db;
}

/* ========== 多媒体上传区域 ========== */
.media-upload-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48rpx 24rpx;
	margin-bottom: 28rpx;
	background: rgba(255,255,255,0.6);
	backdrop-filter: blur(16px) saturate(1.2);
	border: 3rpx dashed rgba(176,106,252,0.25);
	border-radius: 24rpx;
	transition: all 0.3s;
}
.media-upload-area:active {
	background: rgba(176,106,252,0.06);
	border-color: rgba(176,106,252,0.45);
}
.media-upload-icon { font-size: 48rpx; margin-bottom: 12rpx; }
.media-upload-text { font-size: 28rpx; font-weight: 700; color: #6b7280; }
.media-upload-hint { font-size: 22rpx; color: #9ca3af; margin-top: 8rpx; }

/* ========== 图片/视频网格 ========== */
.media-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 24rpx;
}
.media-grid-item {
	width: calc(33.333% - 12rpx);
	aspect-ratio: 1;
	border-radius: 20rpx;
	overflow: hidden;
	position: relative;
	background: rgba(255,255,255,0.5);
	border: 2rpx solid rgba(255,255,255,0.8);
	box-shadow: 0 4rpx 16rpx rgba(167,139,250,0.06);
}
.media-thumb {
	width: 100%;
	height: 100%;
	display: block;
}
.media-thumb-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, rgba(176,106,252,0.06), rgba(244,114,182,0.06));
}
.media-thumb-placeholder-icon { font-size: 48rpx; }
.media-item-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 12rpx 14rpx 10rpx;
	background: linear-gradient(transparent, rgba(0,0,0,0.45));
}
.media-item-name {
	font-size: 20rpx;
	color: #fff;
	font-weight: 600;
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.media-item-duration {
	font-size: 18rpx;
	color: rgba(255,255,255,0.8);
	display: block;
	margin-top: 2rpx;
}
.media-item-del {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 40rpx;
	height: 40rpx;
	line-height: 40rpx;
	text-align: center;
	font-size: 26rpx;
	color: #fff;
	background: rgba(0,0,0,0.35);
	border-radius: 50%;
	backdrop-filter: blur(4px);
}
.media-badge {
	position: absolute;
	top: 8rpx;
	left: 8rpx;
	padding: 2rpx 12rpx;
	background: linear-gradient(135deg, #b06afc, #f472b6);
	border-radius: 10rpx;
}
.media-badge-inline {
	position: static;
	flex-shrink: 0;
}
.media-badge-text {
	font-size: 18rpx;
	color: #fff;
	font-weight: 700;
}
.media-play-btn {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255,255,255,0.85);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
}
.media-play-icon {
	font-size: 24rpx;
	color: #b06afc;
	margin-left: 4rpx;
}

/* ========== 音频列表 ========== */
.media-list { margin-bottom: 24rpx; }
.media-list-item {
	display: flex;
	align-items: center;
	padding: 20rpx 24rpx;
	margin-bottom: 12rpx;
	background: rgba(255,255,255,0.7);
	backdrop-filter: blur(16px) saturate(1.2);
	border-radius: 20rpx;
	border: 2rpx solid rgba(255,255,255,0.85);
	gap: 16rpx;
}
.media-list-icon-wrap {
	width: 72rpx;
	height: 72rpx;
	border-radius: 18rpx;
	background: linear-gradient(135deg, rgba(176,106,252,0.1), rgba(244,114,182,0.08));
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.media-list-icon { font-size: 32rpx; }
.media-list-info { flex: 1; overflow: hidden; }
.media-list-name {
	font-size: 26rpx;
	font-weight: 700;
	color: #374151;
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.media-list-meta {
	font-size: 22rpx;
	color: #9ca3af;
	display: block;
	margin-top: 4rpx;
}
.media-list-del {
	font-size: 32rpx;
	color: #d1d5db;
	flex-shrink: 0;
	padding: 8rpx;
}

/* ========== 媒体空状态 ========== */
.media-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 24rpx 48rpx;
}
.media-empty-icon { font-size: 64rpx; margin-bottom: 16rpx; opacity: 0.6; }
.media-empty-text { font-size: 28rpx; font-weight: 700; color: #9ca3af; }
.media-empty-hint { font-size: 22rpx; color: #c4b5d8; margin-top: 10rpx; text-align: center; }
</style>

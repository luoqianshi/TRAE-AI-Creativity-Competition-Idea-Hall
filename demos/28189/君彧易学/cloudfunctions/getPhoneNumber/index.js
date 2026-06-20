const cloud = require("wx-server-sdk");
cloud.init({
  env: "cloud1-d7ghzcvebc2a95cca",
});

exports.main = async (event, context) => {
  const { code } = event;

  if (!code) {
    return {
      success: false,
      errMsg: "缺少 code 参数",
    };
  }

  try {
    const res = await cloud.openapi.phonenumber.getPhoneNumber({
      code,
    });

    const phoneInfo = res.phoneInfo;
    return {
      success: true,
      phoneNumber: phoneInfo.phoneNumber,
      purePhoneNumber: phoneInfo.purePhoneNumber,
      countryCode: phoneInfo.countryCode,
    };
  } catch (err) {
    return {
      success: false,
      errMsg: err.errMsg || err.message || "获取手机号失败",
    };
  }
};

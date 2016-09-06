var cpZipUtil = require( './lib/cp-zip-util.js' );
var messageUtil = require( './lib/message-util.js' );

exports.processIBZip = cpZipUtil.processCommPlan;
exports.packageCommPlan = cpZipUtil.packageCommPlan;
exports.buildMessageFromTemplate = messageUtil.buildMessageFromTemplate;
exports.buildMessagesFromConfig = messageUtil.buildMessagesFromConfig;
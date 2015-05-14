# https://github.com/thoughtbot/paperclip/issues/1677#issuecomment-102159964
Paperclip::UploadedFileAdapter.content_type_detector = Paperclip::ContentTypeDetector

# The file extension has to match the filetype as determined by Paperclip::ContentTypeDetector,
# otherwise a "spoofed_media_type" exception is thrown, which cannot be turned off.
# See: https://github.com/thoughtbot/paperclip#security-validations
Paperclip.options[:content_type_mappings] = {
  sql: 'text/plain'
}
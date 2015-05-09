require "spec_helper"

describe WorkfileVersion do
  let!(:workfile) { workfile = FactoryGirl.create(:chorus_workfile) }
  let!(:version) { version = FactoryGirl.create(:workfile_version, :workfile => workfile) }
  let!(:version2) { version = FactoryGirl.create(:workfile_version, :workfile => workfile, :version_num => "2") }

  subject { version }

  describe "methods relating to file type" do
    before do
      version.contents = test_file(filename)
    end

    context "with a gif" do
      let(:filename) { "small1.gif" }
      its(:file_type) { should == "image" }
      its(:image?) { should be_true }
      its(:text?) { should be_false }
    end

    context "with a text file with the '.txt' extension" do
      let(:filename) { "multiple_extensions.png.xls.txt" }
      its(:file_type) { should == "text" }
      its(:image?) { should be_false }
      its(:text?) { should be_true }
    end

    context "with a odt file" do
      let(:filename) { "open_office_file.odt" }
      its(:file_type) { should == "other" }
      its(:image?) { should be_false }
      its(:text?) { should be_false }
    end

    context "with a sql file" do
      let(:filename) { "workfile.sql" }
      its(:file_type) { should == "sql" }
      its(:image?) { should be_false }
      its(:text?) { should be_true }
    end

    context "with a text file with no extension" do
      let(:filename) { "no_extension" }
      its(:file_type) { should == "text" }
      its(:image?) { should be_false }
      its(:text?) { should be_true }
    end

    context "with a binary file" do
      let(:filename) { "binary.tar.gz" }
      its(:file_type) { should == "other" }
      its(:image?) { should be_false }
      its(:text?) { should be_false }
    end

    context 'with a pmml file' do
      let(:filename) { 'model.pmml' }
      its(:file_type) { should == 'xml' }
      its(:image?) { should be_false }
      its(:text?) { should be_true }
    end

    context 'code files' do
      %w(cpp rb py js java md).each do |type|
        context "for #{type}" do
          let(:filename) { "code.#{type}" }
          its(:file_type) { should == 'code' }
          its(:image?) { should be_false }
          its(:text?) { should be_true }
        end
      end
    end
  end

  describe "validations" do
    let(:max_file_size) {  ChorusConfig.instance['file_sizes_mb']['workfiles'] }
    let(:user) { users(:owner) }
    it { should validate_attachment_size(:contents).less_than(max_file_size.megabytes) }

    # Workaround for paperclip's lack of proper I18n in error messages
    context "when content has error message with exception message" do
      it "cleans the message" do
        workfile_version = described_class.new({
                                                   :contents => test_file('not_an_image.jpg'),
                                                   :owner => user,
                                                   :modifier => user
                                               })

        workfile_version.should have_error_on(:contents).with_message(:invalid)

        workfile_version.errors[:contents].flatten.join.should_not match(/not recognized by the 'identify' command/)
      end
    end

    context 'when the file name contains special characters' do
      it 'doesnt escape them' do
        workfile_version = described_class.new(:contents => test_file('@invalid'),
                                               :owner => user,
                                               :modifier => user)
        workfile_version.valid? #paperclip callbacks
        workfile_version.file_name.should == '@invalid'
      end
    end
  end

  describe "after_create" do
    it "updates the latest_workfile_version association in the workfile" do
      workfile.latest_workfile_version.should == version2
    end

    it "updates the content_type field in the workfile" do
      workfile.content_type == version2.file_type
    end
  end

  describe "indexing" do
    it "reindexes the workfile after saving" do
      mock(workfile).solr_index
      version.save
    end
  end

  describe "#Update_content" do
    context "when the version is the latest version" do
      before do
        version2.contents = test_file("workfile.sql")
        version2.save
      end

      context "Updating the content of workfile" do
        it "changes the content " do
          version2.update_content("this is new content")
          File.read(version2.contents.path).should == "this is new content"
        end

        it "updates the user_modified_at" do
          expect do
            version2.update_content("this is new content")
          end.to change { workfile.user_modified_at }
        end
      end
    end

    context "when the version is not the latest version" do
      context "Updating the content of workfile" do
        it "raise an error " do
          expect { version.update_content("this is new content") }.to raise_error(ActiveRecord::RecordInvalid)
        end
      end
    end
  end

  describe "#get_content" do
    let(:expected_contents) { File.read(workfile_version.contents.path) }
    context "when the file is a text file" do
      let(:workfile_version) { workfiles(:'text.txt').versions.first }
      it "returns the file contents" do
        workfile_version.get_content.should == expected_contents
      end
    end

    context "when the file is a sql file" do
      let(:workfile_version) { workfiles(:'sql.sql').versions.first }
      it "returns the file contents" do
        workfile_version.get_content.should == expected_contents
      end
    end

    context "when there's a file size limit" do
      let(:workfile_version) { workfiles(:'sql.sql').versions.first }
      let(:offset) { 5 }

      it "only returns the first [limit] characters" do
        workfile_version.get_content(offset).size.should == offset
      end
    end

    context "when the file is NOT a text or sql file" do
      let(:workfile_version) { workfiles(:'image.png').versions.first }
      it "returns nil" do
        workfile_version.get_content.should be_nil
      end
    end

    context 'when it is a pmml file' do
      let(:workfile_version) { workfiles(:'model.pmml').versions.first }
      it 'returns the file contents' do
        workfile_version.get_content.should == expected_contents
      end
    end
  end

  it "should update the user_modified_at after save" do
    expect do
      version2.contents = test_file("workfile.sql")
      version2.save
    end.to change { workfile.user_modified_at }
  end
end

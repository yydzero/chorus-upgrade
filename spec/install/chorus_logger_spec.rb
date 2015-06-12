require 'minimal_spec_helper'
require_relative "../../packaging/install/chorus_logger"
require 'fakefs/spec_helpers'

describe ChorusLogger do
  include FakeFS::SpecHelpers

  let(:logger) { described_class.new({:logfile => logfile, :debug => debug}) }
  let(:logfile) { '/bar.log' }
  let(:debug) { false }

  describe "#log" do
    it "should log to the logfile" do
      logger.log('foo')
      logger.log('bar')
      File.read(logfile).should == "foo\nbar\n"
    end

    context "when the logfile is nested in directories that don't exist" do
      let(:logfile) { '/foo/bar/baz.log' }

      it "should create the missing folders" do
        File.exists?(File.dirname(logfile)).should be_false
        logger.log('quux')
        File.exists?(File.dirname(logfile)).should be_true
        File.read(logfile).should == "quux\n"
      end
    end
  end

  describe "#debug" do
    context "when debug is on" do
      let(:debug) { true }

      it "should debug log to the logfile" do
        logger.debug('foo')
        logger.debug('bar')
        File.read(logfile).should == "foo\nbar\n"
      end

      context "when the logfile is nested in directories that don't exist" do
        let(:logfile) { '/foo/bar/baz.log' }

        it "should create the missing folders" do
          File.exists?(File.dirname(logfile)).should be_false
          logger.debug('quux')
          File.exists?(File.dirname(logfile)).should be_true
          File.read(logfile).should == "quux\n"
        end
      end
    end

    context "when debug is off" do
      let(:debug) { false }

      it "should not debug log to the logfile" do
        logger.debug('foo')
        logger.debug('bar')
        File.exists?(logfile).should be_false
      end
    end
  end

  describe "#capture_output" do
    it "should redirect stdout to the logfile" do
      mock(logger).system("some command >> /bar.log 2>&1")
      logger.capture_output "some command"
    end

    it "should pass the return status back" do
      stub(logger).system(anything) { true }
      logger.capture_output("hi").should be_true
    end
  end
end
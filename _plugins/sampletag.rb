# coding: utf-8

module Jekyll
    class EchoTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @arg = markup
      end
  
      def render(context)
        @arg
      end
    end
  end
  
  Liquid::Template.register_tag("aaa", Jekyll::EchoTag)
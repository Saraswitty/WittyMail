#!/usr/bin/env python
# coding=utf-8

# Versioning is to be kept simple by using the following convention:
# [major].[minor].[patch] [alpha|beta]
#
# Include the optional "alpha" or "beta" string in __version__ itself.
# eg. "1.0.0" or "1.0.2 beta" or "1.1.0"
#
# Update the release date on the day of check-in when the version is updated.
#
# This string is used as-is on the CLI help display and the 'about' page in the GUI
__version__ = "0.1.0 beta"
__release_date__ = "05-Nov-2018"
__pretty_version__ = 'WittyMail v' + __version__ + ' released on ' + __release_date__
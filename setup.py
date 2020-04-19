#!/usr/bin/env python
# coding=utf-8

# Builtins
from typing import List

# Installed packages
from setuptools import setup


package_name: str = 'prokart'
filename: str = 'prokart/src/main.py'


def get_version() -> str:
    """Finds the version number of Prokart.
    :return: The version number.
    :rtype: str
    """
    import ast

    with open(filename) as input_file:
        for line in input_file:
            if line.startswith('__version__'):
                return ast.parse(line).body[0].value.s


def get_long_description() -> str:
    """Returns the description of the program in full.
    :return: The full description from the README file.
    :rtype: str
    """
    try:
        with open('README.md', 'r') as f:
            return f.read()
    except IOError:
        return ''


def get_requirements() -> List[str]:
    """Finds the list of requirements.
    :return: The list of requirements.
    :rtype: List[str]
    """
    with open('requirements.txt', 'r') as f:
        return f.read().splitlines()


setup(
    name=package_name,
    version=get_version(),
    install_requires=get_requirements(),
    author='clockback',
    author_email='elliot@p-s.co.nz',
    description='Prokart',
    url='https://github.com/clockback/prokart',
    long_description=get_long_description(),
    packages=[
        'prokart',
        'prokart.src',
        'prokart.src.modules',
        'prokart.src.modules.pages'
    ],
    include_package_data=True,
    entry_points={
        'console_scripts': [
            'prokart = prokart.src.main:main'
        ]
    },
    license='License :: OSI Approved :: MIT License',
)

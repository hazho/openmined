import React from 'react';
import {
  Box,
  Button,
  Icon,
  SimpleGrid,
  Text,
  Link,
  Heading,
} from '@chakra-ui/react';
import { Link as RRDLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faSlack } from '@fortawesome/free-brands-svg-icons';
import {
  faCommentAlt,
  faPencilAlt,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';

import { prepAccordionAndStatus } from '../../courses/project';
import { hasCompletedCourse, hasStartedProject } from '../../courses/_helpers';
import CourseProgressCard from '../../../components/CourseProgressCard';
import SubmissionInline from '../../../components/SubmissionInline';
import ColoredTabs from '../../../components/ColoredTabs';
import StatusAccordion from '../../../components/StatusAccordion';
import CourseCompleteCard from '../../../components/CourseCompleteCard';

const combineProgressAndCourses = (courses, progress, filter) => {
  let tempCourses = progress.filter(filter);

  if (tempCourses.length > 0) {
    tempCourses = tempCourses.map(({ uid, ...p }) => {
      const courseIndex = courses.findIndex(({ slug }) => uid === slug);

      if (courseIndex !== -1) return { progress: p, ...courses[courseIndex] };

      return p;
    });
  }

  return tempCourses;
};

export const StudentContext = ({ courses, progress }) => {
  const incompleteCourses = combineProgressAndCourses(
    courses,
    progress,
    (c) => !hasCompletedCourse(c)
  );

  if (incompleteCourses.length === 0) {
    return (
      <Box>
        <Text color="gray.700" mb={6}>
          Currently, you're not taking any courses. Perhaps you should add one!
        </Text>
        <Button
          as={RRDLink}
          to="/courses"
          variant="outline"
          colorScheme="black"
        >
          <Icon as={FontAwesomeIcon} icon={faSearch} mr={3} />
          <Text>Browse Courses</Text>
        </Button>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={1} spacing={4} width="full">
      {incompleteCourses.map((c) => (
        <CourseProgressCard key={c.title} content={c} />
      ))}
    </SimpleGrid>
  );
};

const NullSetTabPanel = ({ children }) => (
  <Box
    p={4}
    bg="gray.100"
    color="gray.700"
    borderRadius="md"
    textAlign="center"
    fontStyle="italic"
  >
    {children}
  </Box>
);

export const StudentTabs = ({ courses, progress }) => {
  const MyProjects = () => {
    const projectStartedCourses = combineProgressAndCourses(
      courses,
      progress,
      (c) => hasStartedProject(c)
    );

    if (projectStartedCourses.length === 0) {
      return (
        <NullSetTabPanel>
          You have not started any projects. To start a project begin a course.
        </NullSetTabPanel>
      );
    }

    return projectStartedCourses.map((course) => {
      if (!course.project) return null;

      let { content } = prepAccordionAndStatus(
        course.progress,
        course.project.parts
      );

      content = content.map((i) => ({
        ...i,
        panel: () => (
          <Box>
            <Text color="gray.700" mb={6}>
              {i.description}
            </Text>
            <Text fontWeight="bold" mb={2}>
              Project Reviews
            </Text>
            {i.submissions.map((submission, index) => (
              <SubmissionInline
                key={index}
                link={`/courses/${course.slug}/project/${i._key}/${index}`}
                {...submission}
              />
            ))}
          </Box>
        ),
      }));

      return (
        <Box key={course.title}>
          <Heading as="p" size="md" mb={4}>
            {course.project.title}
          </Heading>
          <StatusAccordion content={content} />
        </Box>
      );
    });
  };

  const CourseHistory = () => {
    const completedCourses = combineProgressAndCourses(courses, progress, (c) =>
      hasCompletedCourse(c)
    );

    if (completedCourses.length === 0) {
      return (
        <NullSetTabPanel>
          Right now you have no completed courses. Try going to the{' '}
          <Link
            as={RRDLink}
            to="/courses"
            textDecoration="underline"
            color="cyan.700"
            _hover={{ color: 'cyan.800' }}
          >
            Course Search
          </Link>{' '}
          to find a course right for you.
        </NullSetTabPanel>
      );
    }

    return (
      <SimpleGrid columns={2} spacing={4} width="full">
        {completedCourses.map((c) => (
          <CourseCompleteCard key={c.title} content={c} />
        ))}
      </SimpleGrid>
    );
  };

  return (
    <ColoredTabs
      content={[
        {
          title: 'My Projects',
          panel: MyProjects,
          px: [8, null, null, 16],
          py: [8, null, null, 12],
        },
        {
          title: 'Course History',
          panel: CourseHistory,
          px: [8, null, null, 16],
          py: [8, null, null, 12],
        },
      ]}
    />
  );
};

export const studentResources = [
  {
    title: 'Discussion Board',
    icon: faCommentAlt,
    link: 'https://discussion.openmined.org',
  },
  {
    title: 'Slack',
    icon: faSlack,
    link: 'https://slack.openmined.org',
  },
  {
    title: 'Github',
    icon: faGithub,
    link: 'https://github.com/OpenMined',
  },
  {
    title: 'Blog',
    icon: faPencilAlt,
    link: 'https://blog.openmined.org',
  },
];
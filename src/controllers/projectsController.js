import mongoose from 'mongoose';
import slugify from 'slugify';
import projectsModel from '../models/projectsModel.js';
import projectsValidationSchema from '../validations/projectsValidation.js';
import cloudinary from '../helpers/cloudinary.js';
import { uploadMultiple, uploadSingle } from '../helpers/upload.js';

// Create a Project
const createProject = async (request, response) => {
  try {
    //Validation
    const { error } = projectsValidationSchema.validate(request.body);

    if (error)
      return response
        .status(400)
        .json({ validationError: error.details[0].message });

    const projectImageResult = await uploadSingle(
      request.body.projectImage,
    );

    const otherProjectImagesResult = await uploadMultiple(
      request.body.otherProjectImages,
    );

    const newProject = new projectsModel({
      title: request.body.title,
      description: request.body.description,
      activitiesPerformed: request.body.activitiesPerformed,
      result: request.body.result,
      employer: request.body.employer,
      year: request.body.year,
      location: request.body.location,
      client: request.body.client,
      category: request.body.category,
      projectImage: projectImageResult.secure_url,
      otherProjectImages: otherProjectImagesResult.images,
      slug: slugify(request.body.title, {
        lower: true,
        strict: true,
      }),
    });

    const Project = await newProject.save();

    response.status(200).json({
      successMessage: 'Project created successfully!',
      otherMessage: otherProjectImagesResult.errors,
      projectContent: Project,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001) {
      response.status(400).json({
        duplicationError:
          'You already have a project with this title!',
      });
    } else {
      response.status(500).json({
        status: 'fail',
        message: error.message,
      });
    }
  }
};

// Getting all the Projects
const getAllProjects = async (request, response) => {
  try {
    let query = [];

    // Only show needed fields
    if (!request.query.allFields) {
      query.push({
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          projectImage: 1,
          category: 1,
          location: 1,
          createdAt: 1,
        },
      });
    }

    // Sort functionality
    if (request.query.sortBy && request.query.sortOrder) {
      var sort = {};
      sort[request.query.sortBy] =
        request.query.sortOrder == 'asc' ? 1 : -1;
      query.push({
        $sort: sort,
      });
    } else {
      query.push({
        $sort: { createdAt: -1 },
      });
    }

    //Getting projects by category
    if (request.query.category) {
      query.push({
        $match: { category: request.query.category },
      });
    }

    // Pagination functionality
    let total = await projectsModel.countDocuments(query);
    let page = request.query.page ? parseInt(request.query.page) : 1;
    let perPage = request.query.perPage
      ? parseInt(request.query.perPage)
      : 5;
    let skip = (page - 1) * perPage;
    query.push({
      $skip: skip,
    });
    query.push({
      $limit: perPage,
    });

    const allProjects = await projectsModel.aggregate(query);

    if (allProjects) {
      response.status(200).json({
        successMessage: 'Projects fetched successfully!',
        allAvailableProjects: allProjects,
        paginationDetails: {
          total: total,
          currentPage: page,
          perPage: perPage,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } else {
      response
        .status(400)
        .json({ ProjectError: 'Projects not found' });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Getting a single Project
const getSingleProject = async (request, response) => {
  try {
    const Project = await projectsModel.findOne({
      slug: request.query.slug,
    });

    if (Project) {
      response.status(200).json({
        successMessage: 'Project fetched successfully!',
        fetchedProject: Project,
      });
    } else {
      response.status(400).json({
        ProjectFetchedError: 'Project not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Getting Project by category
const getProjectByCategory = async (request, response) => {
  try {
    const Project = await projectsModel.find({
      category: request.query.category,
    });

    if (Project) {
      response.status(200).json({
        successMessage: 'Project fetched successfully!',
        fetchedProject: Project,
      });
    } else {
      response.status(400).json({
        ProjectFetchedError: 'Project not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a Project

const updateProject = async (request, response) => {
  try {
    let slug = request.query.slug;

    const Project = await projectsModel.findOne({ slug: slug });

    if (Project) {
      (Project.title = request.body.title || Project.title),
        (Project.description =
          request.body.description || Project.description),
        (Project.activitiesPerformed =
          request.body.activitiesPerformed ||
          Project.activitiesPerformed),
        (Project.result = request.body.result || Project.result),
        (Project.client = request.body.client || Project.client),
        (Project.employer =
          request.body.employer || Project.employer),
        (Project.year = request.body.year || Project.year),
        (Project.location =
          request.body.location || Project.location),
        (Project.category =
          request.body.category || Project.category);

      if (request.body.projectImage) {
        const projectImageResult = await uploadSingle(
          request.body.projectImage,
        );

        Project.projectImage =
          projectImageResult.secure_url || Project.projectImage;
      } else {
        Project.projectImage = Project.projectImage;
      }
      if (
        request.body.otherProjectImages &&
        request.body.otherProjectImages?.length > 0
      ) {
        const otherProjectImagesResult = await uploadMultiple(
          request.body.otherProjectImages,
        );

        Project.otherProjectImages =
          otherProjectImagesResult.images ||
          Project.otherProjectImages;
      } else {
        Project.otherProjectImages = Project.otherProjectImages;
      }

      await Project.save();

      response.status(200).json({
        projectUpdateSuccess: 'Project updated successfully!',
        updatedProject: Project,
      });
    } else {
      response.status(400).json({
        ProjectUpdateError: 'Project not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Delete a Project
const deleteProject = async (request, response) => {
  try {
    let project_id = request.params.project_id;

    if (!mongoose.Types.ObjectId.isValid(project_id)) {
      return response.status(400).json({
        invalidId:
          'Something went wrong, refresh your page and try again!',
      });
    }

    const Project = await projectsModel.findOne({ _id: project_id });

    if (Project) {
      await Project.deleteOne();

      response.status(200).json({
        deletedProject: `Project deleted successfully!`,
      });
    } else {
      response.status(400).json({
        ProjectUpdateError: 'Project not found!',
      });
    }
  } catch (error) {
    // console.log(error);;
    response.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export default {
  createProject,
  getAllProjects,
  getSingleProject,
  getProjectByCategory,
  updateProject,
  deleteProject,
};
